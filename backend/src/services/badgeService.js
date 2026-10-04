const Badge = require("../models/Badge");
const Participant = require("../models/Participant");

function evaluateCondition(currentValue, operator, targetValue) {
  switch (operator) {
    case ">=":
      return currentValue >= targetValue;

    case ">":
      return currentValue > targetValue;

    case "=":
      return currentValue === targetValue;

    default:
      return false;
  }
}

async function evaluateMilestoneBadges(participantId) {
  const participant = await Participant.findById(participantId);

  if (!participant) {
    throw new Error("Participant not found");
  }

  const badges = await Badge.find({
    type: "MILESTONE",
    active: true,
  });

  const earnedBadgeKeys = new Set(
    participant.badges.map((badge) => badge.badgeKey)
  );

  const newlyEarned = [];

  for (const badge of badges) {
    if (!badge.condition) continue;

    const currentValue =
      participant.stats?.[badge.condition.metric] ?? 0;

    const achieved = evaluateCondition(
      currentValue,
      badge.condition.operator,
      badge.condition.value
    );

    if (achieved && !earnedBadgeKeys.has(badge.key)) {
      participant.badges.push({
        badgeKey: badge.key,
        earnedAt: new Date(),
      });

      newlyEarned.push(badge);
    }
  }

  if (newlyEarned.length > 0) {
    await participant.save();
  }

  return newlyEarned;
}

module.exports = {
  evaluateMilestoneBadges,
};
