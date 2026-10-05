const { getLeaderboard, addUsers } = require("../services/leaderboard.services");

const logicLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 500);
    const data = await getLeaderboard(limit);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch leaderboard" });
  }
};

const addLeaderboardUsers = async (req, res) => {
  try {
    const users = Array.isArray(req.body) ? req.body : [req.body];
    const result = await addUsers(users);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    console.error("Add leaderboard users error:", error);
    res.status(500).json({ success: false, message: "Failed to add users" });
  }
};

module.exports = { logicLeaderboard, addLeaderboardUsers };
