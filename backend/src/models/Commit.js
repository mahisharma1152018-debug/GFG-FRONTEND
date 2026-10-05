const mongoose = require("mongoose");

const commitSchema = new mongoose.Schema(
  {
    sha: { type: String, required: true },
    repositoryFullName: { type: String, required: true },
    repositoryId: Number,
    message: String,
    url: String,
    parents: mongoose.Schema.Types.Mixed,
    distinct: Boolean,
    isMergeCommit: Boolean,
    pullRequestNumber: Number,
    author: {
      login: String,
      githubId: Number,
      name: String,
      avatarUrl: String,
    },
    committer: {
      login: String,
      githubId: Number,
      name: String,
      avatarUrl: String,
    },
    authoredAt: Date,
    committedAt: Date,
  },
  { timestamps: true }
);

commitSchema.index({ repositoryFullName: 1, sha: 1 }, { unique: true });
commitSchema.index({ "author.login": 1, committedAt: -1 });
commitSchema.index({ repositoryFullName: 1, committedAt: -1 });
commitSchema.index({ "author.githubId": 1, committedAt: -1 });

module.exports = mongoose.model("Commit", commitSchema);
