const Participant = require("../models/Participant");
const { exactCI } = require("./participantService");
const { syncParticipantByUsername } = require("./participantSyncService");

const GITHUB_USERNAME = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;

// Same response shape as before, backed by live Participant data.
const getLeaderboard = async (limit = 50) => {
  const participants = await Participant.find()
    .sort({ points: -1, "stats.mergedPRs": -1, username: 1 })
    .limit(limit)
    .lean();

  return participants.map((p, index) => ({
    rank: index + 1,
    name: p.name || p.username,
    githubUsername: p.username,
    totalPoints: p.points || 0,
    issuesSolved: p.stats?.issuesSolved || 0,
    prMerged: p.stats?.mergedPRs || 0,
    badges: p.badges?.length || 0,
  }));
};

/*
 * Admin: add participants / award manual points.
 * Input: [{ githubUsername, name?, totalPoints? }]
 * `totalPoints` is stored as bonusPoints, which is added on top of the points
 * computed from GitHub data - so the next sync does not erase it.
 */
const addUsers = async (users) => {
  const valid = [];
  let skipped = 0;

  for (const u of users) {
    const username = String(u?.githubUsername || "").trim();
    if (!GITHUB_USERNAME.test(username)) {
      skipped += 1;
      continue;
    }
    valid.push({ username, name: u.name, bonus: Number(u.totalPoints) || 0 });
  }

  if (valid.length === 0) return { upserted: 0, modified: 0, skipped };

  const result = await Participant.bulkWrite(
    valid.map(({ username, name, bonus }) => ({
      updateOne: {
        filter: { username: exactCI(username) },
        update: {
          $set: { bonusPoints: bonus, ...(name ? { name } : {}) },
          $setOnInsert: { username, githubUrl: `https://github.com/${username}` },
        },
        upsert: true,
      },
    }))
  );

  // Recompute right away so the leaderboard reflects the bonus immediately.
  for (const { username } of valid) {
    await syncParticipantByUsername(username).catch((e) => console.error("leaderboard sync:", e.message));
  }

  return { upserted: result.upsertedCount, modified: result.modifiedCount, skipped };
};

module.exports = { getLeaderboard, addUsers };
