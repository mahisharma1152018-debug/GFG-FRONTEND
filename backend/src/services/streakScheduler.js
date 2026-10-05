const cron = require("node-cron");
const Participant = require("../models/Participant");
const { getYesterdayFormatted } = require("./metricService");


/**
 * Initializes the automated midnight cron task scheduler locked to IST
 */
function initializeMidnightCronWorker() {
  console.log(" Midnight Cron Scheduler Service registered successfully for Asia/Kolkata (IST).");

  // Cron schedule expression: 0 0 * * * -> Triggers exactly at 00:00 (Midnight) every single day
  cron.schedule("0 0 * * *", async () => {
    console.log(" Midnight background streak evaluation worker executing...");
    
    try {
      // Calculate yesterday's date string in IST format to determine if a day was skipped
      const yesterdayStr = getYesterdayFormatted();
      console.log(` Scanning active logs for missing date marker: "${yesterdayStr}"`);

      // Fetch all active participants from MongoDB Atlas directly from the primary node
      const participants = await Participant.find({}).read("primary");
      let resetCount = 0;

      for (const participant of participants) {
        let isModified = false;

        // Check 1: Did they skip a LOGIN yesterday?
        const loggedLoginYesterday = participant.activityLog?.loginDates?.includes(yesterdayStr);
        if (!loggedLoginYesterday && participant.stats.loginStreak > 0) {
          console.log(`Participant @${participant.username} missed a LOGIN day. Resetting streak (${participant.stats.loginStreak} -> 0).`);
          participant.stats.loginStreak = 0;
          isModified = true;
        }

        // Check 2: Did they skip a COMMIT yesterday?
        const loggedCommitYesterday = participant.activityLog?.commitDates?.includes(yesterdayStr);
        if (!loggedCommitYesterday && participant.stats.commitStreak > 0) {
          console.log(` Participant @${participant.username} missed a COMMIT day. Resetting streak (${participant.stats.commitStreak} -> 0).`);
          participant.stats.commitStreak = 0;
          isModified = true;
        }

        // Save the updated counters back to the database only if changes occurred
        if (isModified) {
          await participant.save();
          resetCount++;
        }
      }

      console.log(` Midnight streak sweep complete. Evaluated ${participants.length} profiles. Reset ${resetCount} broken streaks.`);
    } catch (error) {
      console.error(" Midnight background worker runtime exception:", error.message);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Locks execution timeline strictly to Indian Standard Time (IST)
  });
}

module.exports = {
  initializeMidnightCronWorker,
};
