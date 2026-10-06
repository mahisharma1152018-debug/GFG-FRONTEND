const requiredEnv = [
  "MONGODB_URI",
  "GITHUB_WEBHOOK_SECRET",
  "GITHUB_TOKEN",
  "GITHUB_OWNER",
  "SYNC_SECRET",
];

function validateEnv() {
  const missing = requiredEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  const owner = String(process.env.GITHUB_OWNER || '');
  if (!/^[A-Za-z0-9_.-]+$/.test(owner)) {
    throw new Error('GITHUB_OWNER must be a valid GitHub owner name');
  }

  const ownerType = String(process.env.GITHUB_OWNER_TYPE || 'auto').toLowerCase();
  if (!['organization', 'user', 'auto'].includes(ownerType)) {
    throw new Error('GITHUB_OWNER_TYPE must be organization, user, or auto');
  }

  if (process.env.GITHUB_REPO) {
    console.warn(
      "GITHUB_REPO is no longer used. Use GITHUB_REPOS (comma separated, or *) instead."
    );
  }
}

module.exports = {
  validateEnv,
};
