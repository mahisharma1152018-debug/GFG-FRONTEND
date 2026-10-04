const mongoose = require("mongoose");
require("node:dns").setServers(["8.8.8.8", "1.1.1.1"]); // Keeps teammate's network optimization fix

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
