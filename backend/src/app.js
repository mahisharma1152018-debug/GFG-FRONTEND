
require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });

const express = require("express");
const connectDB = require("./config/db.js");
const badgeRoutes = require("./routes/badgeRoutes");
const participantRoutes = require("./routes/participantRoutes"); // 1. Import new routes

const app = express();

// Connect to MongoDB
connectDB();

// Body Parser Middleware
app.use(express.json());

// Routes
app.use("/api/badges", badgeRoutes);
app.use("/api/participants", participantRoutes); // 2. Mount new routes

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
