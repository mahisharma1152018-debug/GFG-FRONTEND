// Own file => own app instance => own rate-limit counters.
const request = require("supertest");
const app = require("../app");

test("the admin secret cannot be brute-forced: sync/admin routes are rate limited", async () => {
  const statuses = [];
  for (let i = 0; i < 25; i++) {
    const res = await request(app).post("/api/github/sync").set("x-sync-secret", `guess-${i}`);
    statuses.push(res.status);
  }
  expect(statuses.slice(0, 20).every((s) => s === 401)).toBe(true);
  expect(statuses.slice(20).every((s) => s === 429)).toBe(true);
});

test("the signed webhook endpoint is not subject to the general limiter", async () => {
  for (let i = 0; i < 110; i++) {
    const res = await request(app).post("/api/github/webhook").set("Content-Type", "application/json").send("{}");
    if (res.status === 429) throw new Error("webhook was rate limited");
  }
});
