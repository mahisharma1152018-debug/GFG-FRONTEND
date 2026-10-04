const { getLeaderboard, addUsers } = require("../services/leaderboard.services");

const logicLeaderboard = async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const data = await getLeaderboard(limit);
  res.status(200).json({ success: true, data });
};

const addLeaderboardUsers = async (req, res) => {
  const users = Array.isArray(req.body) ? req.body : [req.body];
  const created = await addUsers(users);
  res.status(201).json({ success: true, inserted: created.length });
};

module.exports = { logicLeaderboard, addLeaderboardUsers };