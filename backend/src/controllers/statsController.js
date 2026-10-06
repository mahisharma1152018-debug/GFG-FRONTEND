const Repository = require("../models/Repository.js");
const Issue = require("../models/Issue.js");
const Participant = require("../models/Participant.js");
const Badge = require("../models/Badge.js");

async function getEventStats(req, res) {
  try {
    const [repositories, issues, participants, badges] = await Promise.all([
      Repository.countDocuments({ archived: { $ne: true } }),
      Issue.countDocuments({ state: "open" }),
      Participant.countDocuments(),
      Badge.countDocuments({ active: true }),
    ]);

    return res.json({
      success: true,
      data: [
        { id: "repositories", label: "Repositories", value: repositories, suffix: "+", hint: "tracked repositories" },
        { id: "issues", label: "Open Issues", value: issues, suffix: "+", hint: "ready to be solved" },
        { id: "participants", label: "Participants", value: participants, suffix: "+", hint: "individual contributors" },
        { id: "badges", label: "Achievement Badges", value: badges, suffix: "+", hint: "available achievements" },
      ],
    });
  } catch (error) {
    console.error("Event stats fetch failed:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch event statistics" });
  }
}

module.exports = { getEventStats };
