// Runs before every test file. Tests NEVER use the real MONGODB_URI from .env:
// dotenv does not override variables that are already set, so these win.
Object.assign(process.env, {
  NODE_ENV: "test",
  MONGODB_URI: "mongodb://127.0.0.1:1/never_used_in_tests",
  GITHUB_WEBHOOK_SECRET: "test-webhook-secret",
  SYNC_SECRET: "test-sync-secret",
  GITHUB_TOKEN: "test-token",
  GITHUB_OWNER: "gfg-test-org",
  GITHUB_OWNER_TYPE: "organization",
  GITHUB_REPOS: "*",
  GITHUB_CLIENT_ID: "test-client-id",
  GITHUB_CLIENT_SECRET: "test-client-secret",
  CORS_ORIGIN: "",
  SYNC_INTERVAL_MINUTES: "0",
  FRONTEND_URL: "http://localhost:5173",
  AUTH_SUCCESS_REDIRECT: "/",
});
