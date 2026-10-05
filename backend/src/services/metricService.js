// All activity dates are 'YYYY-MM-DD' strings in IST (Asia/Kolkata) so the
// API, the midnight cron job and the GitHub sync always agree on what "today" is.
const TZ = "Asia/Kolkata";
const DAY_MS = 24 * 60 * 60 * 1000;

function getFormattedDate(date = new Date()) {
  // en-CA formats as YYYY-MM-DD
  return new Date(date).toLocaleDateString("en-CA", { timeZone: TZ });
}

function getYesterdayFormatted() {
  return getFormattedDate(new Date(Date.now() - DAY_MS));
}

function shiftDay(dateStr, days) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/**
 * Used when a single new activity is being recorded.
 *  null  -> already recorded today (no change)
 *  true  -> streak continues (yesterday was active, or first ever activity)
 *  false -> streak was broken, restart at 1
 */
function calculateUpdatedStreak(dateHistory = []) {
  if (dateHistory.includes(getFormattedDate())) return null;
  if (dateHistory.includes(getYesterdayFormatted())) return true;
  if (dateHistory.length > 0) return false;
  return true;
}

/**
 * Current streak from a full list of dates. A streak is still "alive" if the
 * last activity was today or yesterday (matches the midnight reset job).
 */
function computeCurrentStreak(dateHistory = []) {
  const days = new Set(dateHistory);
  const today = getFormattedDate();
  let cursor = days.has(today) ? today : getYesterdayFormatted();
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

module.exports = {
  getFormattedDate,
  getYesterdayFormatted,
  calculateUpdatedStreak,
  computeCurrentStreak,
};
