const express = require("express");
const { 
  syncParticipantActivity, 
  getLeaderboard, 
  finalizeEventRankings, 
  trackParticipantActivity, 
  registerParticipant,
  getPublicProfile,
  handleGitHubWebhook
} = require("../controllers/participantController");


const router = express.Router();

router.get("/leaderboard", getLeaderboard);
router.post("/:participantId/sync", syncParticipantActivity);
router.post("/admin/finalize-event", finalizeEventRankings);
router.patch("/:participantId/activity",trackParticipantActivity);
router.post("/register",registerParticipant);
router.get("/profile/:username",getPublicProfile);
router.post("/webhooks/github",handleGitHubWebhook);

module.exports = router;
