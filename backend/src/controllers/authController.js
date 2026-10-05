const crypto = require("node:crypto");
const User = require("../models/User");
const Session = require("../models/Session");
const Participant = require("../models/Participant");
const { parseCookies } = require("../utils/cookies");
const { SESSION_COOKIE, hashToken, cookieOptions, createSession } = require("../middleware/auth");
const { ensureParticipant, recordLoginDay } = require("../services/participantService");
const { syncParticipantFromTracker } = require("../services/participantSyncService");

const STATE_COOKIE = "github_oauth_state";
const githubHeaders = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
const REQUEST_TIMEOUT_MS = 10000;

const stateCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 10 * 60 * 1000,
  path: "/",
});

function githubLogin(req, res) {
  if (!process.env.GITHUB_CLIENT_ID) {
    return res.status(501).json({ success: false, message: "GitHub OAuth is not configured" });
  }

  const state = crypto.randomBytes(24).toString("hex");
  res.cookie(STATE_COOKIE, state, stateCookieOptions());

  const redirectUri =
    process.env.GITHUB_OAUTH_REDIRECT_URI || `${req.protocol}://${req.get("host")}/api/auth/github/callback`;

  // Only the public profile is needed - no e-mail scope.
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "read:user",
    state,
  });
  return res.redirect(`https://github.com/login/oauth/authorize?${params}`);
}

async function githubJson(url, options) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  return response.json();
}

async function githubCallback(req, res) {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    return res.status(501).json({ success: false, message: "GitHub OAuth is not configured" });
  }

  const savedState = parseCookies(req.headers.cookie)[STATE_COOKIE];
  const { code, state } = req.query;
  if (!code || !state || !savedState || state !== savedState) {
    return res.status(400).json({ success: false, message: "Invalid OAuth state" });
  }
  res.clearCookie(STATE_COOKIE, { path: "/" });

  let profile;
  try {
    const tokenData = await githubJson("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { ...githubHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    if (!tokenData.access_token) {
      return res.status(401).json({ success: false, message: "GitHub authentication failed" });
    }

    profile = await githubJson("https://api.github.com/user", {
      headers: { ...githubHeaders, Authorization: `Bearer ${tokenData.access_token}` },
    });
    // The GitHub token is used once, here, and never stored.
  } catch (error) {
    console.error("GitHub OAuth request failed:", error.message);
    return res.status(502).json({ success: false, message: "Could not reach GitHub" });
  }

  if (!profile?.id || !profile?.login) {
    return res.status(401).json({ success: false, message: "Unable to load GitHub profile" });
  }

  // No e-mail is stored or returned.
  await User.updateOne(
    { githubId: profile.id },
    {
      $set: {
        githubId: profile.id,
        username: profile.login,
        name: profile.name,
        avatarUrl: profile.avatar_url,
        profileUrl: profile.html_url,
      },
    },
    { upsert: true }
  );

  // Logging in enrols (or links) the participant and counts today's login.
  const participant = await ensureParticipant({ githubId: profile.id, username: profile.login, name: profile.name });
  await recordLoginDay(participant._id);
  try {
    await syncParticipantFromTracker(participant._id); // pick up PRs/commits made before they logged in
  } catch (error) {
    console.error("Post-login participant sync failed:", error.message);
  }

  const token = await createSession({ githubId: profile.id, username: profile.login });
  res.cookie(SESSION_COOKIE, token, cookieOptions());
  return res.redirect(process.env.AUTH_SUCCESS_REDIRECT || "/");
}

/* Answers from the database only - no call to GitHub. */
async function authMe(req, res) {
  if (!req.user) return res.status(401).json({ success: false, message: "Not authenticated" });

  const [user, participant] = await Promise.all([
    User.findOne({ githubId: req.user.githubId }).lean(),
    Participant.findOne({ githubId: req.user.githubId }, { _id: 1, username: 1, points: 1 }).lean(),
  ]);

  return res.json({
    success: true,
    data: {
      githubId: req.user.githubId,
      username: user?.username || req.user.username,
      name: user?.name,
      avatarUrl: user?.avatarUrl,
      profileUrl: user?.profileUrl,
      participantId: participant?._id || null,
      points: participant?.points ?? 0,
    },
  });
}

async function logout(req, res) {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (token) await Session.deleteOne({ tokenHash: hashToken(token) });
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  return res.json({ success: true });
}

module.exports = { githubLogin, githubCallback, authMe, logout };
