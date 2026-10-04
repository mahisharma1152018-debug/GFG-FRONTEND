function requireSyncSecret(req, res, next) {
  const provided = req.headers["x-sync-secret"];

  if (!provided || provided !== process.env.SYNC_SECRET) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  next();
}

// Export using CommonJS syntax object mapping
module.exports = {
  requireSyncSecret
};
