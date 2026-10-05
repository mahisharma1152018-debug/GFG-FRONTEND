const Participant = require("../models/Participant");
const { evaluateMilestoneBadgesUnlocked } = require("./badgeService");
const { withLock } = require("../utils/keyedLock");
const {
  getFormattedDate,
  calculateUpdatedStreak,
  computeCurrentStreak,
} = require("./metricService");

const POINTS_PER_LOGIN_DAY = 5;

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const exactCI = (value) => new RegExp(`^${escapeRegex(value)}$`, "i");

/*
 * Finds or creates the participant for a GitHub account that just logged in.
 * The GitHub numeric id is the identity; the username is only a label.
 *   1. already linked            -> update profile fields
 *   2. same username, never linked (seeded / added by an organiser) -> link it
 *   3. otherwise                 -> enrol a new participant
 */
async function ensureParticipant({ githubId, username, name }) {
  const base = { githubId, githubUrl: `https://github.com/${username}` };
  if (name) base.name = name;

  let participant;
  try {
    participant = await Participant.findOneAndUpdate(
      { githubId },
      { $set: { ...base, username } },
      { returnDocument: "after" }
    );
  } catch (error) {
    if (error.code !== 11000) throw error; // username changed to one already taken: keep the old label
    participant = await Participant.findOneAndUpdate({ githubId }, { $set: base }, { returnDocument: "after" });
  }
  if (participant) return participant;

  participant = await Participant.findOneAndUpdate(
    { username: exactCI(username), githubId: null },
    { $set: { ...base, username } },
    { returnDocument: "after" }
  );
  if (participant) return participant;

  try {
    return await Participant.create({ username, ...base });
  } catch (error) {
    if (error.code !== 11000) throw error;
    // lost a race with a parallel login of the same account
    const existing = await Participant.findOne({ githubId });
    if (existing) return existing;
    throw error;
  }
}

/*
 * Records today's login (IST) exactly once.
 * The "not already recorded today" check is part of the database update itself,
 * so ten parallel requests award the points once, not ten times.
 * Returns { participant, newlyEarned }, or null when today was already recorded.
 */
async function recordLoginDayUnlocked(participantId) {
  const participant = await Participant.findById(participantId).lean();
  if (!participant) return null;

  const loginDates = participant.activityLog?.loginDates || [];
  if (calculateUpdatedStreak(loginDates) === null) return null;

  const today = getFormattedDate();
  const updated = await Participant.findOneAndUpdate(
    { _id: participantId, "activityLog.loginDates": { $ne: today } },
    {
      $push: { "activityLog.loginDates": today },
      $inc: { points: POINTS_PER_LOGIN_DAY },
      $set: { "stats.loginStreak": computeCurrentStreak([...loginDates, today]) },
    },
    { returnDocument: "after" }
  );

  if (!updated) return null; // another request got there first

  const newlyEarned = await evaluateMilestoneBadgesUnlocked(participantId);
  return { participant: updated, newlyEarned };
}

const recordLoginDay = (participantId) => withLock(participantId, () => recordLoginDayUnlocked(participantId));

module.exports = { ensureParticipant, recordLoginDay, exactCI, POINTS_PER_LOGIN_DAY };
