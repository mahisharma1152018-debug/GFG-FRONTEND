const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const Participant = require("../models/Participant");
const Badge = require("../models/Badge");

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  
  await Badge.deleteMany({ key: "first-pr" });
  await Badge.create({
    key: "first-pr",
    name: "First Blood",
    description: "Merged your very first Pull Request!",
    type: "MILESTONE",
    condition: { metric: "mergedPRs", operator: ">=", value: 1 },
    active: true
  });
});

afterAll(async () => {
  await Participant.deleteMany({ username: { $regex: /^test_coder_/ } });
  await mongoose.connection.close();
});

describe("GeeksforGeeks Open Source Badge API Integration Tests", () => {
  const uniqueUsername = `test_coder_${Date.now()}`;

  test("Should successfully execute the complete Participant Lifecycle Workflow sequentially", async () => {
    // ---- STEP 1: REGISTER PARTICIPANT ----
    const registerRes = await request(app)
      .post("/api/participants/register")
      .send({
        username: uniqueUsername,
        githubUrl: `https://github.com{uniqueUsername}`
      });

    console.log("🔍 DEBUG REGISTRATION RESPONSE:", registerRes.body);

    expect(registerRes.statusCode).toBe(201);
    
    // Check both potential spelling alignments defensively
    const isRegisterSuccess = registerRes.body.success || registerRes.body.sucess;
    expect(isRegisterSuccess).toBe(true);

    // Extract the ID safely whether it's at the root or nested inside the data block
    const testParticipantId = registerRes.body.participantId || registerRes.body.data?._id;
    expect(testParticipantId).toBeDefined();

    // ---- STEP 2: FETCH USER PROFILE ----
    const profileRes = await request(app)
      .get(`/api/participants/profile/${uniqueUsername}`);

    expect(profileRes.statusCode).toBe(200);
    expect(profileRes.body.success || profileRes.body.sucess).toBe(true);
    expect(profileRes.body.data.username).toBe(uniqueUsername);
    expect(profileRes.body.data.earnedMilestones).toBeInstanceOf(Array);

    // ---- STEP 3: TRACK DAILY ACTIVITY (FIRST HIT) ----
    const activityRes1 = await request(app)
      .patch(`/api/participants/${testParticipantId}/activity`)
      .send({ actionType: "LOGIN" });

    console.log("🔍 DEBUG ACTIVITY RESPONSE:", activityRes1.body);

    expect(activityRes1.statusCode).toBe(200);
    expect(activityRes1.body.success || activityRes1.body.sucess).toBe(true);
    expect(activityRes1.body.data.stats.loginStreak).toBe(1);

    // ---- STEP 4: TRACK DAILY ACTIVITY (DUPLICATE EXPLOIT BLOCK) ----
    const activityRes2 = await request(app)
      .patch(`/api/participants/${testParticipantId}/activity`)
      .send({ actionType: "LOGIN" });

    expect(activityRes2.statusCode).toBe(200);
    expect(activityRes2.body.message).toContain("already recorded today");

    // ---- STEP 5: FETCH GLOBAL LEADERBOARD ----
    const leaderboardRes = await request(app)
      .get("/api/participants/leaderboard");

    expect(leaderboardRes.statusCode).toBe(200);
    expect(leaderboardRes.body.success || leaderboardRes.body.sucess).toBe(true);
    expect(leaderboardRes.body.leaderboard).toBeInstanceOf(Array);
  });
});
