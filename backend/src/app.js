// Express app only - no DB connection, cron jobs or listen() here.
// Everything that touches the outside world is started from server.js, so the
// app can be imported by tests/supertest without side effects.
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { allowedOrigins } = require("./config/cors");
const { scrubEmails } = require("./utils/scrub");
const { routeSafety } = require("./middleware/routeSafety");
const { jsonCache, invalidateOnMutation } = require("./middleware/jsonCache");

// Badge & participant engine
const badgeRoutes = require("./routes/badgeRoutes");
const participantRoutes = require("./routes/participantRoutes");
const leaderboardRoutes = require("./routes/leaderboard.routes");

// GitHub tracker
const githubRoutes = require("./routes/github.js");
const pullRequestRoutes = require("./routes/pullRequests.js");
const contributorRoutes = require("./routes/contributors.js");
const repositoryRoutes = require("./routes/repositories.js");
const dataRoutes = require("./routes/data.js");
const issueRoutes = require("./routes/issues.js");
const userRoutes = require("./routes/users.js");
const authRoutes = require("./routes/auth.js");
const statsRoutes = require("./routes/stats.js");

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
// Cookies (login) are only sent cross-origin to origins listed in CORS_ORIGIN.
// Without CORS_ORIGIN the API is plain public-read CORS and the frontend must be same-origin.
const origins = allowedOrigins();
app.use(origins.length ? cors({ origin: origins, credentials: true }) : cors());

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limit for anything guarded by the admin secret - stops brute-forcing it.
const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests" },
});

// Only the signed GitHub webhook is exempt from the general limit
// (GitHub can burst deliveries; each one is HMAC-verified before any work is done).
app.use("/api", (req, res, next) => {
  req.path === "/github/webhook" ? next() : apiLimiter(req, res, next);
});
app.use("/api/github/sync", adminLimiter);
app.use("/api/participants/admin", adminLimiter);
app.use("/api/leaderboard", (req, res, next) => (req.method === "POST" ? adminLimiter(req, res, next) : next()));

// Reject invalid date filters with a clean 400
app.use("/api", (req, res, next) => {
  for (const key of ["since", "until", "from", "to"]) {
    const value = req.query[key];
    if (value !== undefined && Number.isNaN(new Date(value).getTime())) {
      return res.status(400).json({ success: false, message: `Invalid date for "${key}"` });
    }
  }
  next();
});

// The webhook needs the RAW body for signature verification, so it is
// registered before express.json().
app.use("/api/github/webhook", express.raw({ type: "application/json", limit: "25mb" }));
app.use(express.json());
app.use("/api", routeSafety);
app.use("/api", invalidateOnMutation);
app.use("/api", scrubEmails); // never return GitHub e-mail addresses

// Public GET responses are cached in a small JSON file with a short TTL.
// Authenticated/admin mutations invalidate the cache through invalidateOnMutation.
app.use("/api/leaderboard", jsonCache);
app.use("/api/participants/leaderboard", jsonCache);
app.use("/api/participants/profile", jsonCache);
app.use("/api/badges", jsonCache);
app.use("/api/repositories", jsonCache);
app.use("/api/contributors", jsonCache);
app.use("/api/issues", jsonCache);
app.use("/api/stats", jsonCache);

app.use("/api/badges", badgeRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.use("/api/github", githubRoutes);
app.use("/api/pull-requests", pullRequestRoutes);
app.use("/api/contributors", contributorRoutes);
app.use("/api/repositories", repositoryRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/stats", statsRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, status: "healthy" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ success: false, message: "Internal server error" });
});

module.exports = app;
