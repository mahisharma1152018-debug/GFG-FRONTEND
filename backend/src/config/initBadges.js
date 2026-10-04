const Badge = require("../models/Badge");

const baselineBadges = [
  { key: "first-pr", name: "First Blood", description: "Merged your very first Pull Request!", type: "MILESTONE", condition: { metric: "mergedPRs", operator: ">=", value: 1 } },
  { key: "three-prs", name: "Consistent Contributor", description: "Successfully merged 3 Pull Requests!", type: "MILESTONE", condition: { metric: "mergedPRs", operator: ">=", value: 3 } },
  { key: "five-prs", name: "Open Source Champion", description: "Successfully merged 5 Pull Requests!", type: "MILESTONE", condition: { metric: "mergedPRs", operator: ">=", value: 5 } },
  { key: "three-repos", name: "Polyglot Contributor", description: "Merged Pull Requests across 3 different repositories!", type: "MILESTONE", condition: { metric: "uniqueReposContributed", operator: ">=", value: 3 } },
  { key: "daily-login", name: "Dedicated Developer", description: "Logged in every single day during the event window!", type: "MILESTONE", condition: { metric: "loginStreak", operator: ">=", value: 30 } },
  { key: "daily-commit", name: "Unstoppable Force", description: "Committed code every single day of the event!", type: "MILESTONE", condition: { metric: "commitStreak", operator: ">=", value: 30 } }
];

async function initializeProductionBadges() {
  try {
    for (const blueprint of baselineBadges) {
      // upsert: true finds the badge by key and updates it, or creates it if it doesn't exist
      await Badge.updateOne(
        { key: blueprint.key },
        { $set: blueprint },
        { upsert: true }
      );
    }
    console.log(" Baseline Milestone Badge blueprints verified and ready!");
  } catch (error) {
    console.error(" Failed to initialize system badges:", error.message);
  }
}

module.exports = initializeProductionBadges;
