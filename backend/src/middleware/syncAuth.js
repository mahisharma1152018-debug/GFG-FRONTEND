const crypto = require("node:crypto");

function safeEqual(a, b) {
  const left = crypto.createHash("sha256").update(String(a)).digest();
  const right = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(left, right); // constant time, equal-length digests
}

function hasAdminSecret(req) {
  const provided = req.headers["x-sync-secret"];
  const expected = process.env.SYNC_SECRET;
  if (!provided || !expected) return false;
  return safeEqual(provided, expected);
}

function requireSyncSecret(req, res, next) {
  if (!hasAdminSecret(req)) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  next();
}

module.exports = { requireSyncSecret, hasAdminSecret };
