require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require("mongoose");
const Badge = require("./models/Badge");
const Participant = require("./models/Participant");

const seedBadges = [
  { key: "first-pr", name: "First Blood", description: "Merged your very first Pull Request!", type: "MILESTONE", condition: { metric: "mergedPRs", operator: ">=", value: 1 } },
  { key: "three-prs", name: "Consistent Contributor", description: "Successfully merged 3 Pull Requests!", type: "MILESTONE", condition: { metric: "mergedPRs", operator: ">=", value: 3 } },
  { key: "five-prs", name: "Open Source Champion", description: "Successfully merged 5 Pull Requests!", type: "MILESTONE", condition: { metric: "mergedPRs", operator: ">=", value: 5 } },
  { key: "three-repos", name: "Polyglot Contributor", description: "Merged Pull Requests across 3 different repositories!", type: "MILESTONE", condition: { metric: "uniqueReposContributed", operator: ">=", value: 3 } },
  // New Badges
  { key: "daily-login", name: "Dedicated Developer", description: "Logged in every single day during the event window!", type: "MILESTONE", condition: { metric: "loginStreak", operator: ">=", value: 30 } }, // Assuming a 30-day event
  { key: "daily-commit", name: "Unstoppable Force", description: "Committed code every single day of the event!", type: "MILESTONE", condition: { metric: "commitStreak", operator: ">=", value: 30 } }
];

const seedParticipants = [
  {
    username: "gfg_coder_alpha",
    githubUrl: "https://github.com",
    points: 120,
    stats: { mergedPRs: 6, uniqueReposContributed: 4, loginStreak: 30, commitStreak: 30 },
    badges: []
  },
  {
    username: "dev_beta",
    githubUrl: "https://github.com",
    points: 90,
    stats: { mergedPRs: 3, uniqueReposContributed: 2, loginStreak: 15, commitStreak: 20 },
    badges: []
  }
];

async function runSeed() {
 try{

  await mongoose.connect(process.env.MONGODB_URI);

  await Badge.deleteMany({});
  await Badge.insertMany(seedBadges);
  console.log('6 Milestone Badges bluprint created');

  await Participant.deleteMany();
  console.log('collection wiped clea of old duplitcate participants');

  const createdUsers=await Participant.insertMany(seedParticipants);
  console.log("clean test profiles seeded");

  console.log(`\n id:${createdUsers[0]._id}`);
  console.log(`\n id: ${createdUsers[1]._id}`);

  process.exit(0);
 }catch(err){
  console.log("Seeding Failed:",err);
  process.exit(1);
 }
}

runSeed();
