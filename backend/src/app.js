require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

// 1. Import your original Badge & Participant route engines
const badgeRoutes = require("./routes/badgeRoutes");
const participantRoutes = require("./routes/participantRoutes");

const initializeProductionBadges=require("./config/initBadges.js");
const { initializeMidnightCronWorker }=require("./services/schedular.js");

// 2. Import all your teammate's new GitHub tracking data route engines
const githubRoutes = require("./routes/github.js");
const pullRequestRoutes = require("./routes/pullRequests.js");
const contributorRoutes = require("./routes/contributors.js");
const repositoryRoutes = require("./routes/repositories.js");
const dataRoutes = require("./routes/data.js");
const issueRoutes = require("./routes/issues.js");
const userRoutes = require("./routes/users.js");
const authRoutes = require("./routes/auth.js");

const app = express();

// Establish the Database Connection preference
connectDB().then(()=>{
  initializeProductionBadges();
  initializeMidnightCronWorker(); //trigger automated workder initialzation on boot!
});

// 3. Mount teammate's security middleware
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors());

// Configure Rate Limiter to protect endpoints from spamming
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests except webhooks
app.use("/api", (req, res, next) => {
  req.path.startsWith("/github") ? next() : apiLimiter(req, res, next);
});

// Reject invalid date filters with a clean 400 Bad Request
app.use("/api", (req, res, next) => {
  for (const key of ["since", "until", "from", "to"]) {
    const value = req.query[key];
    if (value !== undefined && Number.isNaN(new Date(value).getTime())) {
      return res.status(400).json({ sucess: false, message: `Invalid date for "${key}"` });
    }
  }
  next();
});

// GitHub webhook route must catch raw body parsing configurations
app.use(
  "/api/github/webhook",
  express.raw({
    type: "application/json",
    limit: "25mb" // Allows huge GitHub metadata payloads cleanly
  })
);

// Standard JSON parsers for remaining application pathways
app.use(express.json());

// 4. Mount Your Original Badge & Participant API Routes
app.use("/api/badges", badgeRoutes);
app.use("/api/participants", participantRoutes);

// 5. Mount Teammate's GitHub Data Extractor API Routes
app.use("/api/github", githubRoutes);
app.use("/api/pull-requests", pullRequestRoutes);
app.use("/api/contributors", contributorRoutes);
app.use("/api/repositories", repositoryRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/leaderboard", require("./routes/leaderboard.routes"));
// Server Health Validation check route
app.get("/health", (req, res) => {
  res.status(200).json({ sucess: true, status: "healthy" });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
