const mongoose = require("mongoose");

/*
 * Login sessions live in MongoDB so they survive restarts/deploys.
 * Only a SHA-256 hash of the cookie token is stored - a database leak cannot be
 * replayed as a login.
 */
const sessionSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    githubId: { type: Number, required: true, index: true },
    username: String,
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// MongoDB removes expired sessions automatically; lookups also check expiresAt.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Session", sessionSchema);
