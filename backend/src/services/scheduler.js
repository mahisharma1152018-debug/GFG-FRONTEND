const { getGithubConfig } = require("../config/github.js");
const { syncAllRepos } = require("./repoSyncService.js");
const { syncAllParticipants } = require("./participantSyncService.js");

async function run() {
  try {
    const started = Date.now();
    const summary = await syncAllRepos();

    if (summary.skipped) return;

    console.log(
      `[sync] ${summary.repositories} repos in ${((Date.now() - started) / 1000).toFixed(1)}s`
    );

    const participants = await syncAllParticipants();
    console.log(`[sync] participants refreshed: ${participants.synced}/${participants.total}`);
  } catch (error) {
    console.error("[sync] scheduled run failed:", error.message);
  }
}

function startScheduler() {
  const { syncIntervalMinutes } = getGithubConfig();

  if (!syncIntervalMinutes || syncIntervalMinutes <= 0) {
    console.log("Background sync disabled (SYNC_INTERVAL_MINUTES=0)");
    return;
  }

  console.log(`Background sync every ${syncIntervalMinutes} min`);

  // First run shortly after boot (does the full import for new repos).
  setTimeout(run, 3000);
  setInterval(run, syncIntervalMinutes * 60 * 1000);
}

module.exports = {
  startScheduler,
};
