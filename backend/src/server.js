// Single entry point:  npm start / npm run dev
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const app = require("./app.js");
const connectDB = require("./config/db.js");
const { validateEnv } = require("./config/env.js");
const initializeProductionBadges = require("./config/initBadges.js");
const { startScheduler } = require("./services/scheduler.js");
const { initializeMidnightCronWorker } = require("./services/streakScheduler.js");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    validateEnv();
    await connectDB();
    await initializeProductionBadges();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    startScheduler(); // GitHub polling safety net (+ participant refresh)
    initializeMidnightCronWorker(); // daily streak reset at 00:00 IST
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
