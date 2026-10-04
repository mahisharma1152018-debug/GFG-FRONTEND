const express = require("express");

const {
  getAllBadges,
  getParticipantBadges,
} = require("../controllers/badgeController");

const router = express.Router();

// All available active badges
router.get("/", getAllBadges);

// Badges earned by a participant
router.get(
  "/participant/:participantId",
  getParticipantBadges
);

module.exports = router;
