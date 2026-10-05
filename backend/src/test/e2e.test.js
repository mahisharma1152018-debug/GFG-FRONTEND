/*
 * End-to-end tests against a REAL (throw-away) MongoDB: login, webhooks,
 * participants, badges, leaderboard, authorization, privacy.
 * GitHub itself is faked; the real database in .env is never touched.
 */
jest.mock("../services/pullRequestSyncService", () => ({ syncPullRequest: jest.fn(async () => null) }));

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const { connectTestDb, clearDb, closeTestDb } = require("./helpers/testDb");
const { sendWebhook, mergedPrPayload, pushPayload, sign } = require("./helpers/github");
const initializeProductionBadges = require("../config/initBadges");
const Participant = require("../models/Participant");
const Session = require("../models/Session");
const Issue = require("../models/Issue");
const { createSession, hashToken } = require("../middleware/auth");
const { ensureParticipant } = require("../services/participantService");
const { evaluateMilestoneBadges } = require("../services/badgeService");

const ADMIN = { "x-sync-secret": "test-sync-secret" };

/* What a successful GitHub login does: enrol the participant + create a session. */
async function loginAs(githubId, username) {
  const participant = await ensureParticipant({ githubId, username, name: username });
  const token = await createSession({ githubId, username });
  return { cookie: `github_session=${token}`, participant, token };
}

beforeAll(async () => {
  await connectTestDb();
});
afterAll(closeTestDb);
beforeEach(async () => {
  await clearDb();
  await initializeProductionBadges();
});

describe("login (OAuth)", () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  const fakeGithub = (profile) =>
    (global.fetch = jest.fn(async (url) => {
      if (String(url).includes("login/oauth/access_token")) return { json: async () => ({ access_token: "gh-token" }) };
      if (String(url).includes("api.github.com/user")) return { json: async () => profile };
      throw new Error(`unexpected fetch ${url}`);
    }));

  async function oauthLogin(profile) {
    fakeGithub(profile);
    const start = await request(app).get("/api/auth/github");
    const state = new URL(start.headers.location).searchParams.get("state");
    const callback = await request(app)
      .get(`/api/auth/github/callback?code=abc&state=${state}`)
      .set("Cookie", `github_oauth_state=${state}`);
    return { start, state, callback };
  }

  test("login enrols a participant, stores a hashed DB session, and /me needs no GitHub call", async () => {
    const profile = { id: 4242, login: "Alice", name: "Alice A", email: "alice@example.com", avatar_url: "a", html_url: "h" };
    const { start, callback } = await oauthLogin(profile);

    expect(start.status).toBe(302);
    const scope = new URL(start.headers.location).searchParams.get("scope");
    expect(scope).toBe("read:user"); // no e-mail scope

    expect(callback.status).toBe(302);
    const setCookie = callback.headers["set-cookie"].join(";");
    const token = /github_session=([a-f0-9]+)/.exec(setCookie)[1];

    // enrolled + today's login counted
    const participant = await Participant.findOne({ githubId: 4242 }).lean();
    expect(participant.username).toBe("Alice");
    expect(participant.points).toBe(5);
    expect(participant.stats.loginStreak).toBe(1);

    // only the HASH is stored; no GitHub token, no e-mail
    const session = await Session.findOne({ githubId: 4242 }).lean();
    expect(session.tokenHash).toBe(hashToken(token));
    expect(session.tokenHash).not.toBe(token);
    expect(JSON.stringify(session)).not.toContain("gh-token");
    const rawUser = await mongoose.connection.collection("users").findOne({ githubId: 4242 });
    expect(rawUser.email).toBeUndefined();

    global.fetch.mockClear();
    const me = await request(app).get("/api/auth/me").set("Cookie", `github_session=${token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.username).toBe("Alice");
    expect(String(me.body.data.participantId)).toBe(String(participant._id));
    expect(JSON.stringify(me.body)).not.toContain("alice@example.com");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("rejects a bad OAuth state", async () => {
    fakeGithub({ id: 1, login: "x" });
    const res = await request(app).get("/api/auth/github/callback?code=abc&state=forged").set("Cookie", "github_oauth_state=other");
    expect(res.status).toBe(400);
    expect(await Session.countDocuments()).toBe(0);
  });

  test("GitHub being unreachable gives 502, not a crash", async () => {
    global.fetch = jest.fn(async () => {
      throw new Error("network down");
    });
    const res = await request(app).get("/api/auth/github/callback?code=abc&state=s").set("Cookie", "github_oauth_state=s");
    expect(res.status).toBe(502);
  });

  test("logging in links a participant that an organiser added earlier, keeping its bonus points", async () => {
    await request(app).post("/api/leaderboard").set(ADMIN).send([{ githubUsername: "Bob", name: "Bob B", totalPoints: 40 }]);
    expect((await Participant.findOne({ username: "Bob" })).githubId).toBeNull();

    await oauthLogin({ id: 777, login: "bob", name: "Bob B" });

    expect(await Participant.countDocuments({ username: /^bob$/i })).toBe(1);
    const bob = await Participant.findOne({ githubId: 777 });
    expect(bob.points).toBe(40 + 5); // organiser bonus + today's login
  });

  test("sessions expire and logout deletes the session", async () => {
    const { cookie, token } = await loginAs(1, "carol");
    expect((await request(app).get("/api/auth/me").set("Cookie", cookie)).status).toBe(200);

    await request(app).post("/api/auth/logout").set("Cookie", cookie);
    expect(await Session.countDocuments({ tokenHash: hashToken(token) })).toBe(0);
    expect((await request(app).get("/api/auth/me").set("Cookie", cookie)).status).toBe(401);

    const expired = await createSession({ githubId: 1, username: "carol" });
    await Session.updateOne({ tokenHash: hashToken(expired) }, { expiresAt: new Date(Date.now() - 1000) });
    expect((await request(app).get("/api/auth/me").set("Cookie", `github_session=${expired}`)).status).toBe(401);
  });
});

describe("write endpoints are protected", () => {
  test("register requires login and only enrols YOUR account", async () => {
    expect((await request(app).post("/api/participants/register").send({ username: "torvalds", githubUrl: "x" })).status).toBe(401);

    const { cookie } = await loginAs(10, "mallory");
    const squat = await request(app).post("/api/participants/register").set("Cookie", cookie).send({ username: "torvalds" });
    expect(squat.status).toBe(403);
    expect(await Participant.countDocuments({ username: "torvalds" })).toBe(0);

    const first = await request(app).post("/api/participants/register").set("Cookie", cookie).send({});
    const again = await request(app).post("/api/participants/register").set("Cookie", cookie).send({ username: "MALLORY" });
    expect(first.status).toBe(201);
    expect(again.body.participantId).toBe(first.body.participantId); // idempotent
  });

  test("activity/sync: owner or admin only", async () => {
    const alice = await loginAs(1, "alice");
    const bob = await loginAs(2, "bob");
    const url = (p, tail) => `/api/participants/${p._id}/${tail}`;

    expect((await request(app).patch(url(alice.participant, "activity")).send({ actionType: "LOGIN" })).status).toBe(401);
    expect((await request(app).patch(url(alice.participant, "activity")).set("Cookie", bob.cookie).send({ actionType: "LOGIN" })).status).toBe(403);
    expect((await request(app).post(url(alice.participant, "sync")).set("Cookie", bob.cookie)).status).toBe(403);

    expect((await request(app).patch(url(alice.participant, "activity")).set("Cookie", alice.cookie).send({ actionType: "LOGIN" })).status).toBe(200);
    expect((await request(app).post(url(alice.participant, "sync")).set("Cookie", alice.cookie)).status).toBe(200);
    expect((await request(app).post(url(alice.participant, "sync")).set(ADMIN)).status).toBe(200);
    expect((await request(app).post(url(alice.participant, "sync")).set("x-sync-secret", "wrong")).status).toBe(401);
  });

  test("COMMIT activity cannot be faked through the API", async () => {
    const alice = await loginAs(1, "alice");
    const res = await request(app).patch(`/api/participants/${alice.participant._id}/activity`).set("Cookie", alice.cookie).send({ actionType: "COMMIT" });
    expect(res.status).toBe(400);
    const p = await Participant.findById(alice.participant._id);
    expect(p.points).toBe(0);
    expect(p.stats.commitStreak).toBe(0);
  });

  test("cross-site requests carrying the cookie are blocked (CSRF)", async () => {
    const alice = await loginAs(1, "alice");
    const url = `/api/participants/${alice.participant._id}/activity`;
    const evil = await request(app).patch(url).set("Cookie", alice.cookie).set("Origin", "https://evil.example").send({ actionType: "LOGIN" });
    expect(evil.status).toBe(403);

    process.env.CORS_ORIGIN = "https://app.test";
    try {
      const ok = await request(app).patch(url).set("Cookie", alice.cookie).set("Origin", "https://app.test").send({ actionType: "LOGIN" });
      expect(ok.status).toBe(200);
    } finally {
      process.env.CORS_ORIGIN = "";
    }
  });

  test("a double-click / parallel LOGIN awards the points once", async () => {
    const alice = await loginAs(1, "alice");
    const hit = () => request(app).patch(`/api/participants/${alice.participant._id}/activity`).set("Cookie", alice.cookie).send({ actionType: "LOGIN" });
    const results = await Promise.all(Array.from({ length: 30 }, hit));

    expect(results.every((r) => r.status === 200)).toBe(true);
    expect(results.filter((r) => !/already recorded/.test(r.body.message)).length).toBe(1);

    const p = await Participant.findById(alice.participant._id);
    expect(p.points).toBe(5);
    expect(p.activityLog.loginDates).toHaveLength(1);
    expect(p.stats.loginStreak).toBe(1);
  });

  test("parallel badge evaluation never duplicates a badge", async () => {
    const alice = await loginAs(1, "alice");
    await Participant.updateOne({ _id: alice.participant._id }, { $set: { "stats.mergedPRs": 5 } });
    const runs = await Promise.all(Array.from({ length: 25 }, () => evaluateMilestoneBadges(alice.participant._id)));
    expect(runs.flat()).toHaveLength(3); // each badge reported as newly earned by exactly one caller

    const p = await Participant.findById(alice.participant._id).lean();
    const keys = p.badges.map((b) => b.badgeKey).sort();
    expect(keys).toEqual(["first-pr", "five-prs", "three-prs"]);
  });
});

describe("webhook -> participant -> badges -> leaderboard", () => {
  test("a merged official-task PR gives 50 points, the first-pr badge and a leaderboard entry", async () => {
    const alice = await loginAs(1001, "Alice");

    const res = await sendWebhook(request, app, "pull_request", mergedPrPayload({ id: 1, number: 1, login: "Alice", githubId: 1001, labels: ["official-task"] }));
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Synchronized");

    const profile = await request(app).get("/api/participants/profile/Alice");
    expect(profile.body.data.points).toBe(50);
    expect(profile.body.data.stats.mergedPRs).toBe(1);
    expect(profile.body.data.earnedMilestones.map((b) => b.key)).toContain("first-pr");
    expect(profile.body.data.earnedMilestones[0].name).toBeTruthy(); // profile no longer crashes

    const board = await request(app).get("/api/leaderboard");
    expect(board.body.data[0]).toMatchObject({ rank: 1, githubUsername: "Alice", totalPoints: 50, prMerged: 1, badges: 1 });
    const board2 = await request(app).get("/api/participants/leaderboard");
    expect(board2.body.leaderboard[0].username).toBe("Alice");
    expect(board2.body.leaderboard[0].points).toBe(board.body.data[0].totalPoints); // both boards agree
    expect(String(alice.participant._id)).toBeTruthy();
  });

  test("redeliveries and retriggers never double-award", async () => {
    await loginAs(1001, "Alice");
    const payload = mergedPrPayload({ id: 1, number: 1, login: "Alice", githubId: 1001, labels: ["official-task"] });

    await sendWebhook(request, app, "pull_request", payload, { deliveryId: "same" });
    const dup = await sendWebhook(request, app, "pull_request", payload, { deliveryId: "same" });
    expect(dup.body.message).toBe("Duplicate delivery ignored");
    await sendWebhook(request, app, "pull_request", payload, { deliveryId: "different-id-same-pr" });

    expect((await Participant.findOne({ githubId: 1001 })).points).toBe(50);
  });

  test("label tiers, multiple repos and the repo-based badge", async () => {
    await loginAs(1001, "Alice");
    const send = (id, labels, repoName) => sendWebhook(request, app, "pull_request", mergedPrPayload({ id, number: id, login: "Alice", githubId: 1001, labels, repoName }));
    await send(1, ["good-feature"], "gfg-test-org/a");
    await send(2, ["documentation"], "gfg-test-org/b");
    await send(3, [], "gfg-test-org/c");

    const p = await Participant.findOne({ githubId: 1001 }).lean();
    expect(p.stats.prPoints).toBe(30 + 10 + 10);
    expect(p.stats.uniqueReposContributed).toBe(3);
    expect(p.badges.map((b) => b.badgeKey).sort()).toEqual(["first-pr", "three-prs", "three-repos"]);
  });

  test("push webhooks count commit days (matched by login) and cannot be faked", async () => {
    await loginAs(1001, "Alice");
    await sendWebhook(request, app, "push", pushPayload({ login: "Alice", sha: "abc123" }));

    const p = await Participant.findOne({ githubId: 1001 }).lean();
    expect(p.stats.commitStreak).toBe(1);
    expect(p.activityLog.commitDates).toHaveLength(1);
    expect(p.points).toBe(10);
  });

  test("closed issues assigned to a participant count as issuesSolved", async () => {
    const alice = await loginAs(1001, "Alice");
    await Issue.create({ githubIssueId: 5, repositoryFullName: "gfg-test-org/demo", issueNumber: 5, state: "closed", assignees: [{ githubId: 1001, username: "Alice" }] });
    await Issue.create({ githubIssueId: 6, repositoryFullName: "gfg-test-org/demo", issueNumber: 6, state: "open", assignees: [{ githubId: 1001, username: "Alice" }] });

    await request(app).post(`/api/participants/${alice.participant._id}/sync`).set("Cookie", alice.cookie);
    const board = await request(app).get("/api/leaderboard");
    expect(board.body.data[0].issuesSolved).toBe(1);
  });

  test("PRs by someone who is not a participant are stored but create no participant", async () => {
    const res = await sendWebhook(request, app, "pull_request", mergedPrPayload({ id: 9, number: 9, login: "stranger", githubId: 555 }));
    expect(res.status).toBe(200);
    expect(await Participant.countDocuments()).toBe(0);
  });

  test("webhook security: bad signature and untracked repos", async () => {
    const payload = mergedPrPayload({ id: 1, number: 1, login: "Alice", githubId: 1001 });
    const bad = await sendWebhook(request, app, "pull_request", payload, { signature: "sha256=" + "0".repeat(64) });
    expect(bad.status).toBe(401);

    const other = await sendWebhook(request, app, "pull_request", mergedPrPayload({ id: 2, number: 2, login: "Alice", githubId: 1001, repoName: "someone-else/repo" }));
    expect(other.body.message).toBe("Repository ignored");
    expect(sign("x")).toMatch(/^sha256=/);
  });

  test("the old unauthenticated points webhook is gone", async () => {
    const res = await request(app).post("/api/participants/webhooks/github").send({});
    expect(res.status).toBe(404);
  });
});

describe("leaderboard & admin", () => {
  test("manual bonus points survive a sync; POST needs the admin secret", async () => {
    expect((await request(app).post("/api/leaderboard").send([{ githubUsername: "dave", totalPoints: 10 }])).status).toBe(401);

    const add = await request(app).post("/api/leaderboard").set(ADMIN).send([{ githubUsername: "dave", name: "Dave", totalPoints: 25 }, { githubUsername: "not valid!", totalPoints: 1 }]);
    expect(add.status).toBe(201);
    expect(add.body).toMatchObject({ upserted: 1, skipped: 1 });

    await request(app).post("/api/participants/admin/sync-all").set(ADMIN);
    const board = await request(app).get("/api/leaderboard");
    expect(board.body.data[0]).toMatchObject({ githubUsername: "dave", totalPoints: 25, name: "Dave" });

    // re-posting updates instead of duplicating
    await request(app).post("/api/leaderboard").set(ADMIN).send({ githubUsername: "DAVE", totalPoints: 30 });
    expect(await Participant.countDocuments()).toBe(1);
    expect((await request(app).get("/api/leaderboard")).body.data[0].totalPoints).toBe(30);
  });

  test("finalize-event freezes the podium and rank badges", async () => {
    await request(app).post("/api/leaderboard").set(ADMIN).send([
      { githubUsername: "p1", totalPoints: 300 }, { githubUsername: "p2", totalPoints: 200 },
      { githubUsername: "p3", totalPoints: 100 }, { githubUsername: "p4", totalPoints: 50 },
    ]);
    expect((await request(app).post("/api/participants/admin/finalize-event")).status).toBe(401);

    const res = await request(app).post("/api/participants/admin/finalize-event").set(ADMIN);
    expect(res.body.podium.map((p) => [p.rank, p.username, p.badge])).toEqual([[1, "p1", "rank-1"], [2, "p2", "rank-2"], [3, "p3", "rank-3"]]);

    const badges = await request(app).get("/api/badges");
    expect(badges.body.badges.map((b) => b.key)).toEqual(expect.arrayContaining(["rank-1", "rank-2", "rank-3", "first-pr"]));
  });
});

describe("privacy and input validation", () => {
  test("e-mail addresses never leave the API, even if an old version stored them", async () => {
    await mongoose.connection.collection("users").insertOne({ githubId: 321, username: "old", email: "secret@example.com" });
    await mongoose.connection.collection("commits").insertOne({
      sha: "deadbeef", repositoryFullName: "gfg-test-org/demo", committedAt: new Date(),
      author: { login: "old", githubId: 321, email: "secret@example.com" }, committer: { email: "secret@example.com" },
    });

    for (const url of ["/api/users/321", "/api/data/commits", "/api/data/commits/deadbeef?repo=gfg-test-org/demo", "/api/users/321/commits"]) {
      const res = await request(app).get(url);
      expect(res.status).toBe(200);
      expect(JSON.stringify(res.body)).not.toContain("secret@example.com");
      expect(JSON.stringify(res.body)).not.toMatch(/"email"/);
    }
  });

  test("malformed ids return 400 (not 500)", async () => {
    for (const url of [
      "/api/users/abc", "/api/users/abc/commits", "/api/users/abc/activity", "/api/pull-requests/abc",
      "/api/pull-requests/abc/labels", "/api/repositories/abc/members", "/api/issues/abc", "/api/badges/participant/zzz",
    ]) {
      const res = await request(app).get(url);
      expect([url, res.status]).toEqual([url, 400]);
    }
    expect((await request(app).post("/api/participants/abc/sync").set(ADMIN)).status).toBe(400);
    expect((await request(app).get("/api/users/999999")).status).toBe(404);
    expect((await request(app).get("/api/pull-requests?since=nope")).status).toBe(400);
  });

  test("health and unknown routes", async () => {
    expect((await request(app).get("/health")).body.success).toBe(true);
    expect((await request(app).get("/api/does-not-exist")).status).toBe(404);
  });
});

describe("pure helpers", () => {
  const { computeCurrentStreak, getFormattedDate, getYesterdayFormatted, calculateUpdatedStreak } = require("../services/metricService");
  const { stripEmails } = require("../utils/scrub");
  const { withLock } = require("../utils/keyedLock");

  test("streaks use consecutive IST days ending today or yesterday", () => {
    const today = getFormattedDate();
    const yesterday = getYesterdayFormatted();
    expect(computeCurrentStreak([today, yesterday])).toBe(2);
    expect(computeCurrentStreak([yesterday])).toBe(1);
    expect(computeCurrentStreak(["2020-01-01"])).toBe(0);
    expect(calculateUpdatedStreak([today])).toBeNull();
    expect(calculateUpdatedStreak([yesterday])).toBe(true);
    expect(calculateUpdatedStreak(["2020-01-01"])).toBe(false);
  });

  test("stripEmails removes nested email keys but keeps dates", () => {
    const date = new Date(0);
    expect(stripEmails({ a: 1, email: "x", n: { email: "y", k: [{ email: "z", d: date }] } })).toEqual({ a: 1, n: { k: [{ d: date }] } });
  });

  test("withLock runs same-key calls one at a time", async () => {
    const order = [];
    await Promise.all([1, 2, 3].map((i) => withLock("k", async () => { order.push(`s${i}`); await new Promise((r) => setTimeout(r, 10)); order.push(`e${i}`); })));
    expect(order).toEqual(["s1", "e1", "s2", "e2", "s3", "e3"]);
  });
});
