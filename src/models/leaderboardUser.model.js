const mongoose = require("mongoose");

const leaderboardUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    githubUsername: { type: String, required: true, unique: true },
    totalPoints: { type: Number, default: 0 },
    issuesSolved: { type: Number, default: 0 },
    prMerged: { type: Number, default: 0 },
    badges: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaderboardUser", leaderboardUserSchema);