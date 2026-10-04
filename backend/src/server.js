require("dotenv/config");

const app = require("./app.js");
const connectDB = require("./config/db.js");
const { validateEnv } = require("./config/env.js");
const { startScheduler } = require("./services/scheduler.js");

const PORT =
  process.env.PORT || 5000;


async function startServer() {
  try {
    validateEnv();

    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });

    startScheduler();

  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
}


startServer();