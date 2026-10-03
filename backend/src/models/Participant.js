const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    githubUrl: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    stats: {
      mergedPRs: { type: Number, default: 0 },
      uniqueReposContributed: { type: Number, default: 0 },
      loginStreak: { type: Number, default: 0 },   // New tracker
      commitStreak: { type: Number, default: 0 },  // New tracker
    },

    contributeRepoList: [String],
    // Track exact history to calculate streaks if needed
    activityLog: {
      loginDates: [String],  // Format: 'YYYY-MM-DD'
      commitDates: [String], // Format: 'YYYY-MM-DD'
    },
    badges: [
      {
        badgeKey: {
          type: String,
          required: true,
        },
        earnedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    currentRank: {
      type: Number,
      default: null,
    },
    currentRankBadge: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Participant", participantSchema);
