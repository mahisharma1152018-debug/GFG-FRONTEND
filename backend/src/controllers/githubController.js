const WebhookEvent = require("../models/WebhookEvent.js");

const { syncPullRequest } = require("../services/pullRequestSyncService.js");
const {
  syncAllRepos,
  syncRepo,
  isSyncRunning,
} = require("../services/repoSyncService.js");
const { getTrackedRepos, isRepoTracked } = require("../services/repoService.js");
const { ingestGithubEvent } = require("../services/webhookIngestionService.js");
const { refreshParticipants } = require("../services/participantSyncService.js");

const GITHUB_NAME = /^[A-Za-z0-9_.-]+$/;

function syncErrorStatus(error) {
  const status = Number(error?.status);
  return Number.isInteger(status) && status >= 400 && status <= 599 ? 502 : 500;
}
function validRepoParams(req, res) {
  const { owner, repo, number } = req.params;
  if (!GITHUB_NAME.test(owner || '') || !GITHUB_NAME.test(repo || '')) {
    res.status(400).json({ success: false, message: "Invalid GitHub repository identifier" });
    return false;
  }
  if (number !== undefined && (!/^\d+$/.test(number) || Number(number) < 1)) {
    res.status(400).json({ success: false, message: "Invalid pull request number" });
    return false;
  }
  return true;
}

const HANDLED_EVENTS = new Set([
  "pull_request",
  "pull_request_review",
  "pull_request_review_comment",
  "issues",
  "issue_comment",
  "push",
]);

/*
 * Which participants could have earned something from this event?
 *  - merged PR  -> PR author
 *  - push       -> authors of the pushed commits (commit streaks)
 *  - review     -> the reviewer (review count)
 */
function participantsAffected(eventType, action, payload) {
  const who = (u) => (u ? { id: u.id, login: u.login } : null);

  if (eventType === "pull_request" && action === "closed" && payload.pull_request?.merged) {
    return [who(payload.pull_request.user)];
  }
  if (eventType === "push") {
    return (payload.commits || []).map((c) => ({ login: c.author?.username }));
  }
  if (eventType === "pull_request_review") {
    return [who(payload.review?.user)];
  }
  if (eventType === "issues" && action === "closed") {
    return (payload.issue?.assignees || []).map(who);
  }
  return [];
}

/*
 * GitHub webhook (works for repo-level AND organization-level webhooks).
 */
async function handleGithubWebhook(req, res) {
  const deliveryId = req.headers["x-github-delivery"];
  const eventType = req.headers["x-github-event"];

  if (!deliveryId || !eventType || !Buffer.isBuffer(req.body)) {
    return res.status(400).json({ success: false, message: "Malformed GitHub webhook" });
  }

  let payload;

  try {
    payload = JSON.parse(req.body.toString("utf8"));
  } catch {
    return res.status(400).json({ success: false, message: "Invalid JSON payload" });
  }

  if (eventType === "ping") {
    return res.status(200).json({ success: true, message: "pong" });
  }

  if (!HANDLED_EVENTS.has(eventType)) {
    return res.status(200).json({ success: true, message: "Event ignored" });
  }

  const repository = payload.repository?.full_name;

  if (!repository || !isRepoTracked(repository)) {
    return res.status(200).json({ success: true, message: "Repository ignored" });
  }

  const [owner, name] = repository.split("/");
  const action = payload.action || (eventType === "push" ? "push" : undefined);

  const existingEvent = await WebhookEvent.findOne({ deliveryId });
  if (existingEvent && ["processed", "ignored"].includes(existingEvent.status)) {
    return res.status(200).json({ success: true, message: "Duplicate delivery ignored" });
  }

  const webhookEvent =
    existingEvent ||
    (await WebhookEvent.create({
      deliveryId,
      eventType,
      action,
      repository,
      repositoryId: payload.repository?.id,
      repositoryFullName: repository,
      status: "received",
    }));

  try {
    await ingestGithubEvent(eventType, action, payload, deliveryId);
    if (eventType === "pull_request" && payload.pull_request?.number) {
      await syncPullRequest(owner, name, payload.pull_request.number, { lastWebhookAction: action, lastWebhookDeliveryId: deliveryId });
    }

    // Keep the participant/badge engine in step with the tracker data we just stored.
    await refreshParticipants(participantsAffected(eventType, action, payload));

    webhookEvent.status = "processed";
    webhookEvent.processedAt = new Date();
    webhookEvent.error = undefined;
    await webhookEvent.save();

    return res.status(200).json({
      success: true,
      message: "Synchronized",
      repository,
      event: eventType,
    });
  } catch (error) {
    console.error("Webhook processing failed:", error);

    webhookEvent.status = "failed";
    webhookEvent.error = error.message;
    await webhookEvent.save();

    // 500 so GitHub retries
    return res.status(500).json({ success: false, message: "Failed to process webhook" });
  }
}

/*
 * POST /api/github/sync
 *   ?full=true  -> ignore checkpoints, re-import everything
 *   ?wait=true  -> wait for completion (default: runs in background, returns 202)
 */
async function syncAll(req, res) {
  const full = req.query.full === "true";
  const wait = req.query.wait === "true";

  if (isSyncRunning()) {
    return res.status(409).json({ success: false, message: "A sync is already running" });
  }

  if (!wait) {
    syncAllRepos({ full }).catch((e) => console.error("Manual sync failed:", e));

    return res.status(202).json({
      success: true,
      message: "Sync started. Check progress at GET /api/repositories",
    });
  }

  try {
    const summary = await syncAllRepos({ full });
    return res.json({ success: true, ...summary });
  } catch (error) {
    console.error("Repository sync failed:", error);
    return res.status(syncErrorStatus(error)).json({ success: false, message: "GitHub synchronization failed" });
  }
}

/*
 * POST /api/github/sync/:owner/:repo
 */
async function syncOneRepository(req, res) {
  if (!validRepoParams(req, res)) return;
  const { owner, repo } = req.params;
  const fullName = `${owner}/${repo}`;

  if (!isRepoTracked(fullName)) {
    return res.status(404).json({ success: false, message: "Repository is not tracked" });
  }

  try {
    const repos = await getTrackedRepos();
    const info =
      repos.find((r) => r.fullName.toLowerCase() === fullName.toLowerCase()) ||
      { owner, name: repo, fullName };

    const result = await syncRepo(info, { full: req.query.full === "true" });
    return res.json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    return res.status(syncErrorStatus(error)).json({ success: false, message: "GitHub synchronization failed" });
  }
}

/*
 * POST /api/github/sync/:owner/:repo/:number
 */
async function syncSinglePullRequest(req, res) {
  if (!validRepoParams(req, res)) return;
  const { owner, repo } = req.params;
  const number = Number(req.params.number);

  if (!Number.isInteger(number)) {
    return res.status(400).json({ success: false, message: "Invalid PR number" });
  }

  if (!isRepoTracked(`${owner}/${repo}`)) {
    return res.status(404).json({ success: false, message: "Repository is not tracked" });
  }

  try {
    const saved = await syncPullRequest(owner, repo, number);
    return res.json({ success: true, message: "Pull request synchronized", data: saved });
  } catch (error) {
    console.error(error);
    return res.status(error.status >= 400 && error.status < 500 ? 502 : 500).json({
      success: false,
      message: "Failed to synchronize pull request",
    });
  }
}

module.exports = {
  handleGitHubWebhook: handleGithubWebhook,
  syncAll,
  syncOneRepository,
  syncSinglePullRequest,
};
