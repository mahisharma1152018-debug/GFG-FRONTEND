const crypto = require("node:crypto");
const Session = require("../models/Session");
const Participant = require("../models/Participant");
const { parseCookies } = require("../utils/cookies");
const { allowedOrigins } = require("../config/cors");
const { hasAdminSecret } = require("./syncAuth");

const SESSION_COOKIE = "github_session";
const OBJECT_ID = /^[a-f\d]{24}$/i;

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

function sessionTtlMs() {
  const days = Number(process.env.SESSION_TTL_DAYS);
  return (Number.isFinite(days) && days > 0 ? days : 7) * 24 * 60 * 60 * 1000;
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: sessionTtlMs(),
    path: "/",
  };
}

async function createSession({ githubId, username }) {
  const token = crypto.randomBytes(32).toString("hex");
  await Session.create({
    tokenHash: hashToken(token),
    githubId,
    username,
    expiresAt: new Date(Date.now() + sessionTtlMs()),
  });
  return token;
}

/* Attaches req.user when the request carries a valid session cookie. Never rejects. */
async function authenticate(req, res, next) {
  req.user = null;
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];

  if (token) {
    const session = await Session.findOne({ tokenHash: hashToken(token) }).lean();
    if (session && session.expiresAt > new Date()) {
      req.user = { githubId: session.githubId, username: session.username, sessionId: session._id };
    } else if (session) {
      await Session.deleteOne({ _id: session._id });
    }
  }

  next();
}

/*
 * Cookie-authenticated browsers can be tricked into cross-site writes (CSRF).
 * For state-changing requests, a browser-supplied Origin must be our own host
 * or one of CORS_ORIGIN.
 */
function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // curl / server-to-server / same-origin GET
  if (allowedOrigins().includes(origin.replace(/\/$/, ""))) return true;
  try {
    return new URL(origin).host === req.get("host");
  } catch {
    return false;
  }
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function requireLogin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Login required" });
  }
  if (!SAFE_METHODS.has(req.method) && !originAllowed(req)) {
    return res.status(403).json({ success: false, message: "Cross-origin request blocked" });
  }
  next();
}

/*
 * Allows the participant's own logged-in user, or an admin (x-sync-secret).
 * Loads the participant into req.participant.
 */
async function requireOwnerOrAdmin(req, res, next) {
  const id = req.params.participantId;
  if (!OBJECT_ID.test(id || "")) {
    return res.status(400).json({ success: false, message: "Invalid format provided for participantId parameter." });
  }

  const admin = hasAdminSecret(req);

  if (!admin) {
    if (!req.user) return res.status(401).json({ success: false, message: "Login required" });
    if (!SAFE_METHODS.has(req.method) && !originAllowed(req)) {
      return res.status(403).json({ success: false, message: "Cross-origin request blocked" });
    }
  }

  const participant = await Participant.findById(id);
  if (!participant) return res.status(404).json({ success: false, message: "Participant not found" });

  if (!admin && (!participant.githubId || participant.githubId !== req.user.githubId)) {
    return res.status(403).json({ success: false, message: "You can only act on your own participant profile" });
  }

  req.participant = participant;
  next();
}

module.exports = {
  SESSION_COOKIE,
  OBJECT_ID,
  hashToken,
  cookieOptions,
  createSession,
  authenticate,
  requireLogin,
  requireOwnerOrAdmin,
};
