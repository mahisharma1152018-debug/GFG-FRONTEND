
const Participant = require("../models/Participant");
const { evaluateMilestoneBadges } = require("../services/badgeService");
const { updateRankBadges } = require("../services/rankBadgeService");


const Badge = require("../models/Badge");
const { calculateUpdatedStreak , getFormattedDate } = require("../services/metricService");
const { getParticipantBadges } = require("./badgeController");

const mongoose =require("mongoose");

//GET public profile with badge information
async function getPublicProfile(req,res){
  try{
    const { username } = req.params;

    const participant = await Participant.findOne({ username }).read("primary");
    if(!participant){
      return res.status(404).json({success: false , message: "contributer not found"});
    }

    //add milestone badge metadata details
    const badgeKeys = participant.badges.map(b => b.badgeKey );
    const badgeDefinitions = await Badge.find({key: { $in: badgeKeys }});


    const enrichedBadges = participant.badges.map(earnedBadge => {
      const def = badgeDefinitions.find(d => d.key === earnedBadde.badgeKey);
      return {
        key: earnedBadge.badgeKey,
        name: def?.name || earnedBadge.badgeKey,
        description: def?.description || " Milestone Achievement",
        earnedAt: earnedBadge.earnedAt
      };
    });

    res.status(200).json({
      success: true,
      data:{
        username: participant.username,
        githubUrl: participant.githubUrl,
        points: participant.points,
        rank: participant.currentRank,
        rankBadge: participant.currentRankBadge,
        stats: participant.stats,
        earnedMilestones: enrichedBadges
      }
    });
  }catch(error){
    console.error("profile fetch error:",error);
    res.status(500).json({success: false, message: 'failed to load profile'});
  }
}




// github webhook receiver to process real repo data
async function handleGitHubWebhook(req,res){
  try{
    const eventType = req.headers["x-github-event"];
    const payload = req.body;

    //merged PRs only
    if(eventType==="pull_request" && payload.action==="closed" && payload.pull_request?.merged){
      const githubUsername = payload.pull_request.user.login;
      const repoName = payload.repository.full_name;

      const participant = await Participant.findOneAndDelete({username: githubUsername});

      //logic for giving points
      if(participant){
        const labels = payload.pull_request.labels || [];
        const labelNames= labels.map(l => l.name.toLowerCase());

        let pointsToAward =10;   //default

        if(labelNames.includes("official-task") || labelNames.includes("assigned-issue")){
          pointToAward=50;
        }
        else if(labelNames.includes("good-feature") || labelNames.includes("intermediate")){
          pointsToAward=30;
        }
        else if(labelNames.includes("basic") || labelNames.includes("documentation")){
          pointsToAward=10;
        }

        //update participant metrics and points
        participant.stats.mergedPRs+=1;
        participant.points+=pointsToAward;

        //tracking multi repo rules
        if(!participant.contributedReposList.includes(repoName)){
          participant.contributedReposList.push(repoName);
          participant.stats.uniqueReposContributed = participant.contributedRepoLst.length;
        }

        //processing daily commit streak metrics
        const todayStr=getFormattedDate();
        const streakEvaluation = calculateUpdatedStreak(participant.activityLog.commitDates,'COMMIT');

        if(streakEvaluation === true){
          participant.stats.commitStreak+=1;
        }
        else if (streakEvaluation===false){
          participant.stats.commitStreak=1;
        }

        if(!participant.activityLog.commitDates.includes(todayStr)){
          participant.activityLog.commitDates.push(todaystr);
        }

        await participant.save();

        await evaluateMilestoneBadges(participant._id);

        console.log(`Awarded ${pointsToAward} points to ${githubUsername} for merging a PR.`);

      }
    }

    res.status(200).json({success:true,message: "Webhook processed successfully"});
  }catch(error){
    console.error("Webhook processing error:",error);
    res.status(500).json({success:false, messahe: "webhook execuation error"});
  }
}


//helper function to handle  internal calls to API endpoints
async function fetchTeammateData(endpoint){
  try{
     const basePort = process.env.NODE_ENV === 'test' ? '5055' : '5055'; 
    const response = await fetch(`http://localhost:${basePort}${endpoint}`);
    if(!response.ok) return null;
  return await response.json();
  }
  catch(error){
    console.error(`Failed to fetch from teammates(sai's) endpoint ${endpoint}:`,error.message);
    return null;
  }
}



/* this function takes participantId as parem and find the participant*/

async function syncParticipantActivity(req, res) {
  try {
    const { participantId } = req.params;

    // 1. Find participant and ensure they have a linked githubId
    const  participant = await Participant.findById(participantId);
    if (!participant) {
      return res.status(404).json({ success: false, message: "Participant not found" });
    }

    const githubId = participant.githubId || participant.username; // Fallback mapping

    // 2. Fetch data sets concurrently from your teammate's endpoints
    const [prData, activityData, reviewData] = await Promise.all([
      fetchTeammateData(`/api/users/${githubId}/pull-requests`),
      fetchTeammateData(`/api/users/${githubId}/activity`),
      fetchTeammateData(`/api/users/${githubId}/reviews`)
    ]);

    // 3. Process Pull Request Metrics & Unique Repository Calculations
    if (prData && Array.isArray(prData)) {
      // Filter for successfully merged pull requests
      const mergedPRsList = prData.filter(pr => pr.merged === true || pr.state === 'closed');
      participant.stats.mergedPRs = mergedPRsList.length;

      // Extract unique repository full names from the PR payloads
      const uniqueRepos = new Set(mergedPRsList.map(pr => pr.repository?.full_name).filter(Boolean));
      participant.contributedReposList = Array.from(uniqueRepos);
      participant.stats.uniqueReposContributed = uniqueRepos.size;
    }

    // 4. Process Reviews Metric (Optional milestone check)
    if (reviewData && Array.isArray(reviewData)) {
      participant.stats.codeReviews = reviewData.length;
    }

    // 5. Process Commits and Dashboard Interaction Streaks from Activity Log
    if (activityData && activityData.activityLog) {
      // Assume teammate stores arrays of raw date strings ['YYYY-MM-DD', ...]
      const remoteCommits = activityData.activityLog.commitDates || [];
      const remoteLogins = activityData.activityLog.loginDates || [];

      // Sync explicit raw history items cleanly
      participant.activityLog.commitDates = [...new Set([...participant.activityLog.commitDates, ...remoteCommits])].sort();
      participant.activityLog.loginDates = [...new Set([...participant.activityLog.loginDates, ...remoteLogins])].sort();

      // Recalculate calendar streak counters dynamically using the historical arrays
      let currentCommitStreak = 0;
      let currentLoginStreak = 0;

      // Evaluate historical timeline logs to determine accurate streak numbers
      participant.activityLog.commitDates.forEach((_, index) => {
        const historySlice = participant.activityLog.commitDates.slice(0, index + 1);
        const res = calculateUpdatedStreak(historySlice, 'COMMIT');
        if (res === true) currentCommitStreak += 1;
        else if (res === false) currentCommitStreak = 1;
      });

      participant.activityLog.loginDates.forEach((_, index) => {
        const historySlice = participant.activityLog.loginDates.slice(0, index + 1);
        const res = calculateUpdatedStreak(historySlice, 'LOGIN');
        if (res === true) currentLoginStreak += 1;
        else if (res === false) currentLoginStreak = 1;
      });

      participant.stats.commitStreak = currentCommitStreak;
      participant.stats.loginStreak = currentLoginStreak;
    }

    // 6. Calculate total accrued points based on new metrics calculations
    // Example formula: 50pts per merged PR, 20pts per unique repo, 10pts per active commit day
    participant.points = (participant.stats.mergedPRs * 50) + 
                         (participant.stats.uniqueReposContributed * 20) + 
                         (participant.stats.commitStreak * 10) + 
                         (participant.stats.loginStreak * 5);

    // Save newly synchronized state data definitions down to MongoDB Atlas
    await participant.save();

    // 7. Run evaluation engine to award milestone badges based on fresh metrics values
    const newlyEarnedMilestones = await evaluateMilestoneBadges(participantId);

    res.status(200).json({
      success: true,
      message: "Data successfully synchronized from GitHub API endpoints!",
      data: {
        username: participant.username,
        points: participant.points,
        stats: participant.stats,
        newlyEarnedMilestones: newlyEarnedMilestones.map(b => b.key),
        totalMilestonesCount: participant.badges.length
      }
    });
  } catch (error) {
    console.error("Refactored Sync Error:", error);
    res.status(500).json({ success: false, message: "Internal server error during GitHub API sync." });
  }
}



async function getLeaderboard(req, res) {
  try {
    // Fetch all participants sorted by points descending
    const leaderboard = await Participant.find()
      .sort({ points: -1 })
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




// dynamic calender based streak logic

async function trackParticipantActivity(req, res) {
  try {
    const { participantId } = req.params;
    const { actionType } = req.body; // Expects either 'LOGIN' or 'COMMIT'

    if (!['LOGIN', 'COMMIT'].includes(actionType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid actionType. Must be either 'LOGIN' or 'COMMIT'."
      });
    }

    //  CRUCIAL FIX: Validate and safely cast the incoming plain string ID 
    // into a proper Mongoose ObjectId structure before running the database query.
    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid format provided for participantId parameter."
      });
    }

    const participant = await Participant.findById(participantId).read("primary");
    if (!participant) {
      return res.status(404).json({ success: false, message: "Participant not found" });
    }

    // Ensure the baseline tracking structures are initialized cleanly
    if (!participant.activityLog) {
      participant.activityLog = { loginDates: [], commitDates: [] };
    }

    const todayStr = getFormattedDate();

    if (actionType === 'LOGIN') {
      // 1. Evaluate calendar history rules for streak continuation
      const streakResult = calculateUpdatedStreak(participant.activityLog.loginDates, 'LOGIN');

      if (streakResult === null) {
        // User already logged in today -> Block multiple updates on the same day
        return res.status(200).json({
          success: true,
          message: "Daily login already recorded today. Streak remains active!",
          data: {
            username: participant.username,
            points: participant.points,
            stats: participant.stats
          }
        });
      }

      // 2. Apply modifications based on calendar comparison
      if (streakResult === true) {
        participant.stats.loginStreak += 1; // Kept the chain alive from yesterday
      } else if (streakResult === false) {
        participant.stats.loginStreak = 1;  // Missed a day, streak resets to 1
      }

      // 3. Append today's date and reward active participation points
      participant.activityLog.loginDates.push(todayStr);
      participant.points += 5;

    } else if (actionType === 'COMMIT') {
      // 1. Evaluate calendar history rules for streak continuation
      const streakResult = calculateUpdatedStreak(participant.activityLog.commitDates, 'COMMIT');

      if (streakResult === null) {
        // User already pushed a commit today -> Block multiple updates on the same day
        return res.status(200).json({
          success: true,
          message: "Daily commit already recorded today. Streak remains active!",
          data: {
            username: participant.username,
            points: participant.points,
            stats: participant.stats
          }
        });
      }

      // 2. Apply modifications based on calendar comparison
      if (streakResult === true) {
        participant.stats.commitStreak += 1; // Continued streak
      } else if (streakResult === false) {
        participant.stats.commitStreak = 1;  // Broke streak, reset to 1
      }

      // 3. Append today's date and reward points
      participant.activityLog.commitDates.push(todayStr);
      participant.points += 10;
    }

    // Save changes to the database
    await participant.save();

    // 4. Run the milestone system immediately to see if the new streak unlocks a badge
    const newlyEarned = await evaluateMilestoneBadges(participant._id);

    res.status(200).json({
      success: true,
      message: `${actionType} tracked and processed successfully!`,
      newlyEarnedBadges: newlyEarned.map(b => b.key),
      data: {
        username: participant.username,
        points: participant.points,
        stats: participant.stats
      }
    });
  } catch (error) {
    console.error("Error inside trackParticipantActivity:", error);
    res.status(500).json({ success: false, message: "Internal server error while tracking activity" });
  }
}


async function registerParticipant(req,res){
  try{
    const {username,githubUrl} = req.body;

    if(!username || !githubUrl){
      return res.status(400).json({
        sucess: false,
        message: "Please provide both username and githuburl."
      });
    }


    //check if the username is already taken
    const existingUser = await Participant.findOne({username});
    if(existingUser){
      return res.status(400).json({
        success:false,
        message: "userame is already registered."
      });
    }

    //create and save the new participant 
    const newParticipant = new Participant({
      username,
      githubUrl,
      point:0,
      stats:{
        mergedPRs:0,
        uniqueReposContibuted:0,
        loginStreak:0,
        commitStreak:0
      },
      badges:[]
    });


    await newParticipant.save();

    res.status(201).json({
      success: true,
      message:"Participant registered successfully!!",
      participantId: newParticipant._id,
      data: newParticipant
        });
  }catch(err){
    console.error("Registered error:",err);
    res.status(500).json({
      success: false,
      message: "Server error during registration."
    });
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




// Update your module.exports at the bottom:
module.exports = {
  syncParticipantActivity,
  getLeaderboard,
  finalizeEventRankings,
  trackParticipantActivity, 
  registerParticipant,
   handleGitHubWebhook,
   getPublicProfile
};
