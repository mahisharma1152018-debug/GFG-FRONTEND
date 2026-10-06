const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const BLOCKED_QUERY_KEYS = new Set(["__proto__", "prototype", "constructor"]);
const MAX_OBJECT_DEPTH = 12;

function containsDangerousKey(value, depth = 0) {
  if (depth > MAX_OBJECT_DEPTH) return true;
  if (!value || typeof value !== "object") return false;
  for (const [key, child] of Object.entries(value)) {
    if (BLOCKED_QUERY_KEYS.has(key) || key.startsWith("$") || key.includes("[")) return true;
    if (containsDangerousKey(child, depth + 1)) return true;
  }
  return false;
}

function routeSafety(req, res, next) {
  const rawUrl = String(req.originalUrl || "");

  if (rawUrl.length > 4096) {
    return res.status(414).json({ success: false, message: "Request URI too long" });
  }

  if (rawUrl.includes("\0") || rawUrl.includes("%00")) {
    return res.status(400).json({ success: false, message: "Invalid request path" });
  }

  // Decode once so encoded traversal cannot bypass the check.
  try {
    const decodedPath = decodeURIComponent(req.path || "");
    if (decodedPath.split("/").some((segment) => segment === "..")) {
      return res.status(400).json({ success: false, message: "Invalid request path" });
    }
  } catch {
    return res.status(400).json({ success: false, message: "Malformed request path" });
  }

  // Prevent common prototype-pollution keys before they reach controllers.
  if (containsDangerousKey(req.query || {}) || containsDangerousKey(req.body || {})) {
    return res.status(400).json({ success: false, message: "Invalid request data" });
  }

  // API mutations should use JSON; webhook is also application/json and remains allowed.
  if (!SAFE_METHODS.has(req.method)) {
    const contentType = String(req.headers["content-type"] || "").toLowerCase();
    const hasBody = req.headers["content-length"] && Number(req.headers["content-length"]) > 0;
    if (hasBody && !contentType.includes("application/json")) {
      return res.status(415).json({ success: false, message: "JSON request body required" });
    }
  }

  return next();
}

module.exports = { routeSafety };
