const mongoose = require("mongoose");
const Participant = require("../models/Participant");
const Badge = require("../models/Badge");
const { syncParticipantFromTracker, syncAllParticipants } = require("../services/participantSyncService");
const { ensureParticipant, recordLoginDay } = require("../services/participantService");

// GET public profile with badge information
async function getPublicProfile(req, res) {
  try {
    const { username } = req.params;

    const participant = await Participant.findOne({ username }).read("primary");
    if (!participant) {
      return res.status(404).json({ success: false, message: "contributor not found" });
    }

    const badgeKeys = participant.badges.map((b) => b.badgeKey);
    const badgeDefinitions = await Badge.find({ key: { $in: badgeKeys } });

    const enrichedBadges = participant.badges.map((earnedBadge) => {
      const def = badgeDefinitions.find((d) => d.key === earnedBadge.badgeKey);
      return {
        key: earnedBadge.badgeKey,
        name: def?.name || earnedBadge.badgeKey,
        description: def?.description || "Milestone Achievement",
        earnedAt: earnedBadge.earnedAt,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        username: participant.username,
        githubUrl: participant.githubUrl,
        points: participant.points,
        rank: participant.currentRank,
        rankBadge: participant.currentRankBadge,
        stats: participant.stats,
        earnedMilestones: enrichedBadges,
      },
    });
  } catch (error) {
    console.error("profile fetch error:", error);
    res.status(500).json({ success: false, message: "failed to load profile" });
  }
}

// POST /api/participants/:participantId/sync   (owner or admin)
// Pulls this participant's PRs / commits / reviews / issues from the tracker's collections.
async function syncParticipantActivity(req, res) {
  try {
    const { participant, newlyEarned } = await syncParticipantFromTracker(req.participant._id);

    res.status(200).json({
      success: true,
      message: "Data successfully synchronized from GitHub tracker data!",
      data: {
        username: participant.username,
        points: participant.points,
        stats: participant.stats,
        newlyEarnedMilestones: newlyEarned.map((b) => b.key),
        totalMilestonesCount: participant.badges.length,
      },
    });
  } catch (error) {
    console.error("Participant sync error:", error);
    res.status(500).json({ success: false, message: "Internal server error during GitHub data sync." });
  }
}

async function getLeaderboard(req, res) {
  try {
    // Fetch all participants sorted by points descending
    const leaderboard = await Participant.find()
      .sort({ points: -1, "stats.mergedPRs": -1, username: 1 })
      .select("username points stats currentRank currentRankBadge badges");

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      leaderboard,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard data",
    });
  }
}




// PATCH /api/participants/:participantId/activity   (owner or admin)
// Only LOGIN can be reported by a client. Commit activity is derived from the
// GitHub data the tracker collects, so it cannot be faked through the API.
async function trackParticipantActivity(req, res) {
  try {
    const { actionType } = req.body || {};

    if (actionType === "COMMIT") {
      return res.status(400).json({
        success: false,
        message: "COMMIT activity is derived from GitHub data and cannot be reported manually.",
      });
    }
    if (actionType !== "LOGIN") {
      return res.status(400).json({ success: false, message: "Invalid actionType. Must be 'LOGIN'." });
    }

    const result = await recordLoginDay(req.participant._id);

    if (!result) {
      const current = await Participant.findById(req.participant._id).lean();
      return res.status(200).json({
        success: true,
        message: "Daily login already recorded today. Streak remains active!",
        data: { username: current.username, points: current.points, stats: current.stats },
      });
    }

    const fresh = await Participant.findById(result.participant._id).lean();

    res.status(200).json({
      success: true,
      message: "LOGIN tracked and processed successfully!",
      newlyEarnedBadges: result.newlyEarned.map((b) => b.key),
      data: { username: fresh.username, points: fresh.points, stats: fresh.stats },
    });
  } catch (error) {
    console.error("Error inside trackParticipantActivity:", error);
    res.status(500).json({ success: false, message: "Internal server error while tracking activity" });
  }
}

// POST /api/participants/register   (login required)
// You can only enrol YOUR OWN GitHub account - the username comes from the session,
// so nobody can register (or squat) someone else's username.
async function registerParticipant(req, res) {
  try {
    const { username } = req.body || {};

    if (username && String(username).toLowerCase() !== String(req.user.username).toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "You can only register your own GitHub account.",
      });
    }

    const participant = await ensureParticipant({
      githubId: req.user.githubId,
      username: req.user.username,
      name: req.body?.name,
    });

    try {
      await syncParticipantFromTracker(participant._id);
    } catch (syncError) {
      console.error("Initial tracker sync failed:", syncError.message);
    }

    const fresh = await Participant.findById(participant._id);
    res.status(201).json({
      success: true,
      message: "Participant registered successfully!!",
      participantId: fresh._id,
      data: fresh,
    });
  } catch (err) {
    console.error("Registered error:", err);
    res.status(500).json({ success: false, message: "Server error during registration." });
  }
}

async function syncEveryParticipant(req, res) {
  try {
    const summary = await syncAllParticipants();
    res.status(200).json({ success: true, ...summary });
  } catch (error) {
    console.error("Bulk participant sync failed:", error);
    res.status(500).json({ success: false, message: "Failed to sync participants" });
  }
}

async function finalizeEventRankings(req, res) {
  try {
    const { updateRankBadges } = require("../services/rankBadgeService");
    await updateRankBadges();

    const topThree = await Participant.find({ currentRank: { $in: [1, 2, 3] } }).sort({ currentRank: 1 });

    res.status(200).json({
      success: true,
      message: "Event finalized! Dynamic rank badges successfully frozen and awarded to the podium winners.",
      podium: topThree.map(p => ({
        rank: p.currentRank,
        username: p.username,
        points: p.points,
        badge: p.currentRankBadge
      }))
    });
  } catch (error) {
    console.error("Finalization failed:", error);
    res.status(500).json({ success: false, message: "Failed to finalize event rankings" });
  }
}




module.exports = {
  syncParticipantActivity,
  syncEveryParticipant,
  getLeaderboard,
  finalizeEventRankings,
  trackParticipantActivity,
  registerParticipant,
  getPublicProfile,
};
