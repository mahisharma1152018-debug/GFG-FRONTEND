const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true, index: true },
  repositoryId: { type: Number, index: true },
  repositoryFullName: String,
  githubReviewId: Number,
  githubCommentId: Number,
  githubIssueId: Number,
}, { timestamps: true });

schema.index({ repositoryId: 1, occurredAt: -1 });

module.exports = mongoose.model("ContributionEvent", schema);
