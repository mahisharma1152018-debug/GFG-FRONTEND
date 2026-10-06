const fs = require("node:fs");
const path = require("node:path");

const CACHE_DIR = path.resolve(__dirname, "../../.cache");
const CACHE_FILE = path.join(CACHE_DIR, "api-cache.json");
const DEFAULT_MAX_ENTRIES = 250;
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;
let writeQueue = Promise.resolve();
let cacheGeneration = 0;
let memoryStore = null;

function ttlMs() {
  const seconds = Number(process.env.JSON_CACHE_TTL_SECONDS);
  return (Number.isFinite(seconds) && seconds > 0 ? seconds : 60) * 1000;
}

function maxEntries() {
  const value = Number(process.env.JSON_CACHE_MAX_ENTRIES);
  return Number.isInteger(value) && value > 0 ? Math.min(value, 2000) : DEFAULT_MAX_ENTRIES;
}

function maxBytes() {
  const value = Number(process.env.JSON_CACHE_MAX_BYTES);
  return Number.isInteger(value) && value > 0 ? Math.min(value, 50 * 1024 * 1024) : DEFAULT_MAX_BYTES;
}

function readStore() {
  try {
    const stat = fs.statSync(CACHE_FILE);
    if (stat.size > maxBytes()) return {};
    const parsed = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function store() {
  if (memoryStore === null) memoryStore = readStore();
  return memoryStore;
}

function prune(input) {
  const now = Date.now();
  const entries = Object.entries(input).filter(([, entry]) =>
    entry && Number.isFinite(entry.createdAt) && now - entry.createdAt < ttlMs()
  );

  entries.sort((a, b) => a[1].createdAt - b[1].createdAt);
  const limited = entries.slice(-maxEntries());
  const next = Object.fromEntries(limited);

  // Enforce a byte limit without deleting the newest entry first.
  while (Object.keys(next).length > 0) {
    if (Buffer.byteLength(JSON.stringify(next), "utf8") <= maxBytes()) break;
    const oldestKey = Object.entries(next).sort((a, b) => a[1].createdAt - b[1].createdAt)[0][0];
    delete next[oldestKey];
  }
  return next;
}

function writeStore(input) {
  const next = prune(input);
  memoryStore = next;
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const temp = `${CACHE_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(next), { encoding: "utf8", mode: 0o600 });
  fs.renameSync(temp, CACHE_FILE);
}

function enqueueWrite(input) {
  const generation = cacheGeneration;
  writeQueue = writeQueue
    .catch(() => undefined)
    .then(() => {
      if (generation !== cacheGeneration) return;
      writeStore(input);
    });
  return writeQueue;
}

function keyFor(req) {
  return `${req.method}:${req.originalUrl}`;
}

function get(key) {
  const current = store();
  const entry = current[key];
  if (!entry) return null;

  if (!entry.createdAt || Date.now() - entry.createdAt >= ttlMs()) {
    delete current[key];
    void enqueueWrite(current);
    return null;
  }

  return entry;
}

function set(key, body, status = 200) {
  const current = store();
  current[key] = { createdAt: Date.now(), status, body };
  memoryStore = prune(current);
  void enqueueWrite(memoryStore);
}

function clear() {
  cacheGeneration += 1;
  memoryStore = {};
  try {
    fs.rmSync(CACHE_FILE, { force: true });
  } catch {
    // Cache is an optimization; failure to clear it must never break a request.
  }
}

function jsonCache(req, res, next) {
  if (req.method !== "GET") return next();

  // Never cache a request carrying a session cookie. This prevents accidental
  // cross-user sharing if a protected GET is mounted under a cached prefix later.
  if (req.headers.cookie?.includes("github_session=")) return next();

  const key = keyFor(req);
  const hit = get(key);
  if (hit) {
    res.setHeader("X-JSON-Cache", "HIT");
    return res.status(hit.status).json(hit.body);
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        set(key, body, res.statusCode);
        res.setHeader("X-JSON-Cache", "MISS");
      } catch (error) {
        console.warn("JSON cache write skipped:", error.message);
      }
    }
    return originalJson(body);
  };

  return next();
}

function invalidateOnMutation(req, res, next) {
  if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS") {
    clear();
  }
  next();
}

module.exports = {
  CACHE_FILE,
  jsonCache,
  invalidateOnMutation,
  clear,
};
