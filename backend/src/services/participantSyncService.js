/*
 * Bridge between the GitHub tracker (PullRequest / Commit / Review / Issue /
 * User collections filled by webhooks + polling) and the Participant/badge engine.
 *
 * Reads the tracker's collections directly and recomputes a participant's stats
 * from scratch, so it is idempotent: webhook retries and re-syncs never double count.
 * The result is written with a single atomic update (it never overwrites a login day
 * recorded by a concurrent request).
 */
const Participant = require("../models/Participant");
const PullRequest = require("../models/PullRequest");
const Commit = require("../models/Commit");
const Review = require("../models/Review");
const Issue = require("../models/Issue");
const User = require("../models/User");
const { evaluateMilestoneBadgesUnlocked } = require("./badgeService");
const { withLock } = require("../utils/keyedLock");
const { getFormattedDate, computeCurrentStreak } = require("./metricService");
const { exactCI, POINTS_PER_LOGIN_DAY } = require("./participantService");

const POINTS = {
  HIGH: 50, // official-task / assigned-issue
  MEDIUM: 30, // good-feature / intermediate
  DEFAULT: 10, // basic / documentation / anything else
  LOGIN_DAY: POINTS_PER_LOGIN_DAY,
  COMMIT_DAY: 10,
};

function labelNames(pr) {
  const source = Array.isArray(pr.labelsAtMerge) && pr.labelsAtMerge.length ? pr.labelsAtMerge : pr.labels || [];
  return source.map((l) => String(l?.name ?? l).toLowerCase());
}

function pointsForPR(pr) {
  const names = labelNames(pr);
  if (names.includes("official-task") || names.includes("assigned-issue")) return POINTS.HIGH;
  if (names.includes("good-feature") || names.includes("intermediate")) return POINTS.MEDIUM;
  return POINTS.DEFAULT;
}

/*
 * Identity rule: once a participant is linked to a GitHub id (login does this),
 * ONLY that id is used. The username is used only for participants that were
 * never linked.
 */
function identityFilters(participant, githubId) {
  if (githubId) {
    return {
      author: { "author.githubId": githubId },
      // Commits from the push webhook only carry a login (no numeric id) until the
      // next polling sync fills it in, so those are matched by login as well.
      commit: {
        $or: [
          { "author.githubId": githubId },
          { "author.login": exactCI(participant.username), "author.githubId": null },
        ],
      },
      review: { "reviewer.githubId": githubId },
      assignee: { "assignees.githubId": githubId },
    };
  }
  const rx = exactCI(participant.username);
  return {
    author: { "author.username": rx },
    commit: { "author.login": rx },
    review: { "reviewer.username": rx },
    assignee: { "assignees.username": rx },
  };
}

async function syncUnlocked(id) {
  const participant = await Participant.findById(id).lean(); // always work from fresh data
  if (!participant) throw new Error("Participant not found");

  let githubId = participant.githubId || null;
  let autoLinked = false;
  if (!githubId) {
    const trackerUser = await User.findOne({ username: exactCI(participant.username) }).lean();
    if (trackerUser?.githubId) {
      githubId = trackerUser.githubId;
      autoLinked = true;
    }
  }

  const f = identityFilters(participant, githubId);

  const [mergedPRs, commits, reviewCount, issuesSolved] = await Promise.all([
    PullRequest.find({ merged: true, ...f.author }, { repositoryFullName: 1, labels: 1, labelsAtMerge: 1 }).lean(),
    Commit.find(f.commit, { committedAt: 1 }).lean(),
    Review.countDocuments(f.review),
    Issue.countDocuments({ state: "closed", ...f.assignee }),
  ]);

  const repos = [...new Set(mergedPRs.map((pr) => pr.repositoryFullName).filter(Boolean))].sort();
  const prPoints = mergedPRs.reduce((sum, pr) => sum + pointsForPR(pr), 0);

  const trackerCommitDays = [...new Set(commits.filter((c) => c.committedAt).map((c) => getFormattedDate(c.committedAt)))];
  const commitDates = [...new Set([...(participant.activityLog?.commitDates || []), ...trackerCommitDays])].sort();
  const loginDates = participant.activityLog?.loginDates || [];

  const set = {
    "stats.mergedPRs": mergedPRs.length,
    "stats.uniqueReposContributed": repos.length,
    "stats.prPoints": prPoints,
    "stats.codeReviews": reviewCount,
    "stats.issuesSolved": issuesSolved,
    "stats.commitStreak": computeCurrentStreak(commitDates),
    "stats.loginStreak": computeCurrentStreak(loginDates),
    contributedReposList: repos,
    points:
      prPoints +
      loginDates.length * POINTS.LOGIN_DAY +
      commitDates.length * POINTS.COMMIT_DAY +
      (participant.bonusPoints || 0),
  };
  if (autoLinked) set.githubId = githubId;

  await Participant.updateOne(
    { _id: id },
    { $set: set, $addToSet: { "activityLog.commitDates": { $each: trackerCommitDays } } }
  );

  const newlyEarned = await evaluateMilestoneBadgesUnlocked(id);
  const updated = await Participant.findById(id);
  return { participant: updated, newlyEarned };
}

const syncParticipantFromTracker = (participantOrId) => {
  const id = participantOrId?._id || participantOrId;
  return withLock(id, () => syncUnlocked(id));
};

async function syncParticipantByUsername(username) {
  if (!username) return null;
  const participant = await Participant.findOne({ username: exactCI(username) }, { _id: 1 }).lean();
  if (!participant) return null; // not registered for the event -> nothing to do
  return syncParticipantFromTracker(participant._id);
}

/* Webhooks identify people by login; a linked participant may have an old username, so also try githubId. */
async function syncParticipantByGithubUser({ id, login }) {
  const byId = id ? await Participant.findOne({ githubId: id }, { _id: 1 }).lean() : null;
  if (byId) return syncParticipantFromTracker(byId._id);
  return syncParticipantByUsername(login);
}

async function syncAllParticipants() {
  const participants = await Participant.find({}, { _id: 1, username: 1 }).lean();
  let synced = 0;
  let failed = 0;

  for (const participant of participants) {
    try {
      await syncParticipantFromTracker(participant._id);
      synced += 1;
    } catch (error) {
      failed += 1;
      console.error(`[participants] sync failed for @${participant.username}:`, error.message);
    }
  }

  return { total: participants.length, synced, failed };
}

/*
 * Called from the webhook / scheduler. Never throws: a participant refresh
 * problem must not make GitHub think the webhook failed (it would retry).
 * Accepts logins (strings) or { id, login } objects.
 */
async function refreshParticipants(users = []) {
  const seen = new Set();
  for (const entry of users) {
    const user = typeof entry === "string" ? { login: entry } : entry;
    if (!user?.login && !user?.id) continue;
    const key = user.id ? `id:${user.id}` : `login:${user.login.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    try {
      await syncParticipantByGithubUser(user);
    } catch (error) {
      console.error(`[participants] refresh failed for @${user.login || user.id}:`, error.message);
    }
  }
}

module.exports = {
  POINTS,
  pointsForPR,
  syncParticipantFromTracker,
  syncParticipantByUsername,
  syncAllParticipants,
  refreshParticipants,
};
