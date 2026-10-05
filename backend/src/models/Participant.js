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
    // Numeric GitHub user id (same type the tracker's User/PullRequest collections use)
    githubId: {
      type: Number,
      default: null,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    stats: {
      mergedPRs: { type: Number, default: 0 },
      uniqueReposContributed: { type: Number, default: 0 },
      loginStreak: { type: Number, default: 0 },
      commitStreak: { type: Number, default: 0 },
      codeReviews: { type: Number, default: 0 },
      prPoints: { type: Number, default: 0 },      // points earned from merged PRs (label based)
      issuesSolved: { type: Number, default: 0 },  // closed issues assigned to the participant
    },

    // Points added by organisers (POST /api/leaderboard). Kept separate from `points`
    // so a sync - which recomputes `points` from GitHub data - never wipes them.
    bonusPoints: { type: Number, default: 0 },

    contributedReposList: [String],
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
