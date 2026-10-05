const crypto = require("node:crypto");

const sign = (raw) =>
  "sha256=" + crypto.createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET).update(raw).digest("hex");

let deliveryCounter = 0;

/* Sends a correctly signed GitHub webhook delivery. */
function sendWebhook(request, app, event, payload, { deliveryId, signature } = {}) {
  const raw = JSON.stringify(payload);
  return request(app)
    .post("/api/github/webhook")
    .set("Content-Type", "application/json")
    .set("x-github-event", event)
    .set("x-github-delivery", deliveryId || `delivery-${++deliveryCounter}`)
    .set("x-hub-signature-256", signature || sign(raw))
    .send(raw);
}

const repo = (name = "gfg-test-org/demo") => ({ id: 900, full_name: name, default_branch: "main", html_url: `https://github.com/${name}` });

function mergedPrPayload({ id, number, login, githubId, labels = [], repoName }) {
  const now = new Date().toISOString();
  return {
    action: "closed",
    repository: repo(repoName),
    sender: { id: githubId, login },
    pull_request: {
      id,
      number,
      title: `PR ${number}`,
      html_url: `https://github.com/x/y/pull/${number}`,
      state: "closed",
      merged: true,
      user: { id: githubId, login },
      merged_by: { id: 1, login: "maintainer" },
      base: { ref: "main", repo: { id: 900, full_name: repoName || "gfg-test-org/demo" } },
      head: { ref: "feature" },
      labels: labels.map((name, i) => ({ id: i + 1, name })),
      merged_at: now,
      created_at: now,
      updated_at: now,
      closed_at: now,
    },
  };
}

function pushPayload({ login, sha, repoName }) {
  return {
    ref: "refs/heads/main",
    repository: repo(repoName),
    sender: { login },
    commits: [
      {
        id: sha,
        message: "work",
        timestamp: new Date().toISOString(),
        distinct: true,
        author: { username: login, name: login },
        committer: { username: login, name: login },
      },
    ],
  };
}

module.exports = { sendWebhook, mergedPrPayload, pushPayload, sign };
