/*
 * Per-key async mutex. Calls with the same key run one after another; different
 * keys run in parallel. Used to serialise all writes for ONE participant
 * (login recording, badge awards, stats sync) so they can't interleave.
 *
 * This protects a single Node process, which is how this app is designed to run
 * (the scheduler and the midnight cron live in-process). The database updates
 * are additionally conditional, which is the safeguard on a MongoDB server.
 */
const tails = new Map();

async function withLock(key, fn) {
  const id = String(key);
  const previous = tails.get(id) || Promise.resolve();

  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const tail = previous.then(() => gate);
  tails.set(id, tail);

  await previous;
  try {
    return await fn();
  } finally {
    release();
    if (tails.get(id) === tail) tails.delete(id);
  }
}

module.exports = { withLock };
