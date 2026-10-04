
require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });

const express = require("express");
const connectDB = require("./config/db.js");
const initializeProductionBadges = require("./config/initBadges.js");
const badgeRoutes = require("./routes/badgeRoutes");
const participantRoutes = require("./routes/participantRoutes"); // 1. Import new routes

const app = express();

// Connect to MongoDB
connectDB().then(()=>{
  initializeProductionBadges(); //trigger the sync check automatically
});

// Body Parser Middleware
app.use(express.json());

// Routes
app.use("/api/badges", badgeRoutes);
app.use("/api/participants", participantRoutes); // 2. Mount new routes

// At the bottom of backend/src/app.js, make sure you export the app instance
module.exports = app;

// Only execute listen if the file is run directly (not required by testing frameworks)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
