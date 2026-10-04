const LeaderboardUser = require("../models/leaderboardUser.model");

const getLeaderboard = async (limit = 50) => {
  const users = await LeaderboardUser.find()
    .sort({ totalPoints: -1, prMerged: -1 })
    .limit(limit)
    .lean();

  return users.map((user, index) => ({ rank: index + 1, ...user }));
};

const addUsers = async (users) => {
  return LeaderboardUser.insertMany(users, { ordered: false });
};

module.exports = { getLeaderboard, addUsers };