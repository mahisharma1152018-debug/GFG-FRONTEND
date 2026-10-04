const express = require("express");
const { logicLeaderboard, addLeaderboardUsers } = require("../controllers/leaderboard.controller");

const router = express.Router();

router.get("/", logicLeaderboard);
router.post("/", addLeaderboardUsers);

module.exports = router;