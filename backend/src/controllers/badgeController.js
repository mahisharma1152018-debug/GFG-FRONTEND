const Badge = require("../models/Badge");
const Participant = require("../models/Participant");

// Get all active badges
async function getAllBadges(req, res) {
  try {
    const badges = await Badge.find({
      active: true,
    }).sort({
      type: 1,
      name: 1,
    });

    res.status(200).json({
      success: true,
      count: badges.length,
      badges,
    });
  } catch (error) {
    console.error("Error fetching badges:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch badges",
    });
  }
}

// Get badges earned by a participant
async function getParticipantBadges(req, res) {
  try {
    const { participantId } = req.params;

    if (!/^[a-f\d]{24}$/i.test(participantId)) {
      return res.status(400).json({ success: false, message: "Invalid participantId" });
    }

    const participant = await Participant.findById(participantId);

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant not found",
      });
    }

    const badgeKeys = participant.badges.map(
      (badge) => badge.badgeKey
    );

    const badgeDefinitions = await Badge.find({
      key: { $in: badgeKeys },
      active: true,
    });

    const badges = participant.badges.map((earnedBadge) => {
      const definition = badgeDefinitions.find(
        (badge) => badge.key === earnedBadge.badgeKey
      );

      return {
        key: earnedBadge.badgeKey,
        name: definition?.name || earnedBadge.badgeKey,
        description: definition?.description || "",
        type: definition?.type || "MILESTONE",
        earnedAt: earnedBadge.earnedAt,
      };
    });

    res.status(200).json({
      success: true,
      count: badges.length,
      badges,
    });
  } catch (error) {
    console.error("Error fetching participant badges:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch participant badges",
    });
  }
}

module.exports = {
  getAllBadges,
  getParticipantBadges,
};
