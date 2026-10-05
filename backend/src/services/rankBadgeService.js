const Participant = require("../models/Participant");

async function updateRankBadges() {
  const participants = await Participant.find()
    .sort({ points: -1, "stats.mergedPRs": -1, username: 1 }) // same tie-break as the leaderboard
    .select("_id points");

  const operations = participants.map((participant, index) => {
    const rank = index + 1;

    let rankBadge = null;

    if (rank === 1) {
      rankBadge = "rank-1";
    } else if (rank === 2) {
      rankBadge = "rank-2";
    } else if (rank === 3) {
      rankBadge = "rank-3";
    }

    return {
      updateOne: {
        filter: {
          _id: participant._id,
        },

        update: {
          $set: {
            currentRank: rank,
            currentRankBadge: rankBadge,
          },
        },
      },
    };
  });

  if (operations.length > 0) {
    await Participant.bulkWrite(operations);
  }
}

module.exports = {
  updateRankBadges,
};
