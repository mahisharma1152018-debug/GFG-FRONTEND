const express = require("express");
const { logicLeaderboard, addLeaderboardUsers } = require("../controllers/leaderboard.controller");
const { requireSyncSecret } = require("../middleware/syncAuth.js");

const router = express.Router();

router.get("/", logicLeaderboard);
router.post("/", requireSyncSecret, addLeaderboardUsers);

module.exports = router;
