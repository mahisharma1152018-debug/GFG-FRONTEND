// One-off cleanup: removes e-mail addresses stored by older versions.
//   npm run scrub-emails
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");

async function run() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Native collection calls: the schemas no longer contain these fields, so
  // mongoose would silently drop the $unset.
  const users = await db.collection("users").updateMany({ email: { $exists: true } }, { $unset: { email: "" } });
  const commits = await db
    .collection("commits")
    .updateMany(
      { $or: [{ "author.email": { $exists: true } }, { "committer.email": { $exists: true } }] },
      { $unset: { "author.email": "", "committer.email": "" } }
    );

  console.log(`users cleaned: ${users.modifiedCount}, commits cleaned: ${commits.modifiedCount}`);
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
