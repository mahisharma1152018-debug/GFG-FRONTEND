const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    githubId: { type: Number, required: true, unique: true, index: true },
    username: { type: String, index: true },
    name: String,
    avatarUrl: String,
    profileUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
