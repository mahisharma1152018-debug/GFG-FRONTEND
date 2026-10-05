const express = require("express");
const {
  syncParticipantActivity,
  syncEveryParticipant,
  getLeaderboard,
  finalizeEventRankings,
  trackParticipantActivity,
  registerParticipant,
  getPublicProfile,
} = require("../controllers/participantController");
const { requireSyncSecret } = require("../middleware/syncAuth.js");
const { authenticate, requireLogin, requireOwnerOrAdmin } = require("../middleware/auth.js");

const router = express.Router();

router.use(authenticate); // attaches req.user when a valid session cookie is present

// Public
router.get("/leaderboard", getLeaderboard);
router.get("/profile/:username", getPublicProfile);

// Must be logged in; the account is taken from the session
router.post("/register", requireLogin, registerParticipant);

// Admin only (x-sync-secret)
router.post("/admin/finalize-event", requireSyncSecret, finalizeEventRankings);
router.post("/admin/sync-all", requireSyncSecret, syncEveryParticipant);

// The participant's own logged-in user, or admin
router.post("/:participantId/sync", requireOwnerOrAdmin, syncParticipantActivity);
router.patch("/:participantId/activity", requireOwnerOrAdmin, trackParticipantActivity);

module.exports = router;
