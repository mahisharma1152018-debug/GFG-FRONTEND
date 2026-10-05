/*
 * Test database. Safe by construction:
 *  - uses MONGODB_TEST_URI if set (its database name MUST contain "test"),
 *  - otherwise starts a throw-away in-memory MongoDB (mongodb-memory-server),
 *  - never reads MONGODB_URI.
 */
const mongoose = require("mongoose");

let memoryServer = null;

function assertSafe(uri) {
  const match = uri.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]*)/);
  const dbName = match ? match[1] : "";
  if (!/test/i.test(dbName)) {
    throw new Error(`Refusing to run tests: MONGODB_TEST_URI database name "${dbName}" must contain "test".`);
  }
}

async function connectTestDb() {
  let uri = process.env.MONGODB_TEST_URI;

  if (uri) {
    assertSafe(uri);
  } else {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri("gfg_unit_test");
  }

  await mongoose.connect(uri);
  return uri;
}

async function clearDb() {
  for (const model of Object.values(mongoose.models)) {
    await model.deleteMany({});
  }
}

async function closeTestDb() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}

module.exports = { connectTestDb, clearDb, closeTestDb };
