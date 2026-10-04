const express = require("express");

// Destructure the imports cleanly from the controller using require()
const {
  handleGitHubWebhook,
  syncAll,
  syncOneRepository,
  syncSinglePullRequest
} = require("../controllers/githubController.js");

// Import the middleware layers using require()
const { githubWebhookMiddleware } = require("../middleware/githubWebhook.js");
const { requireSyncSecret } = require("../middleware/syncAuth.js");

const router = express.Router();

// GitHub webhook (repo or organization level)
router.post("/webhook", githubWebhookMiddleware, handleGitHubWebhook);

// Sync ALL tracked repos
router.post("/sync", requireSyncSecret, syncAll);

// Sync one repo
router.post("/sync/:owner/:repo", requireSyncSecret, syncOneRepository);

// Sync one PR
router.post("/sync/:owner/:repo/:number", requireSyncSecret, syncSinglePullRequest);

// Export using CommonJS syntax
module.exports = router;
