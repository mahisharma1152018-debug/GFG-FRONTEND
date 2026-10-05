const Badge = require("../models/Badge");
const Participant = require("../models/Participant");
const { withLock } = require("../utils/keyedLock");

function evaluateCondition(currentValue, operator, targetValue) {
  switch (operator) {
    case ">=": return currentValue >= targetValue;
    case ">": return currentValue > targetValue;
    case "=": return currentValue === targetValue;
    default: return false;
  }
}

/*
 * Awards every milestone badge the participant currently qualifies for.
 * Each award is a single conditional update ("push unless already there"), so
 * concurrent calls (double clicks, webhook + scheduler) can never create a
 * duplicate badge entry.
 */
async function evaluateMilestoneBadgesUnlocked(participantId) {
  const participant = await Participant.findById(participantId).lean();
  if (!participant) throw new Error("Participant not found");

  const badges = await Badge.find({ type: "MILESTONE", active: true });
  const earned = new Set((participant.badges || []).map((b) => b.badgeKey));
  const newlyEarned = [];

  for (const badge of badges) {
    if (!badge.condition || earned.has(badge.key)) continue;

    const current = participant.stats?.[badge.condition.metric] ?? 0;
    if (!evaluateCondition(current, badge.condition.operator, badge.condition.value)) continue;

    // Returns the document only if THIS call added the badge (filter + push are one atomic step).
    const awarded = await Participant.findOneAndUpdate(
      { _id: participantId, "badges.badgeKey": { $ne: badge.key } },
      { $push: { badges: { badgeKey: badge.key, earnedAt: new Date() } } }
    );

    if (awarded) newlyEarned.push(badge);
  }

  return newlyEarned;
}

/* Safe to call concurrently for the same participant. */
const evaluateMilestoneBadges = (participantId) =>
  withLock(participantId, () => evaluateMilestoneBadgesUnlocked(participantId));

module.exports = { evaluateMilestoneBadges, evaluateMilestoneBadgesUnlocked };
