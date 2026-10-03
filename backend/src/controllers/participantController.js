
const Participant = require("../models/Participant");
const { evaluateMilestoneBadges } = require("../services/badgeService");
const { updateRankBadges } = require("../services/rankBadgeService");


const Badge = require("../models/Badge");
const { calculateUpdatedStreak , getFormattedDate } = require("../services/metricService");
const { getParticipantBadges } = require("./badgeController");


//GET public profile with badge information
async function getPublicProfile(req,res){
  try{
    const { username } = req.params;

    const participant = await Participant.findOneAndDelete({ username });
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
      sucess: true,
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


/* this function takes participantId as parem and find the participant*/
async function syncParticipantActivity(req, res) {
  try {
    const { participantId } = req.params;

    const participant = await Participant.findById(participantId);
    if (!participant) {
      return res.status(404).json({ success: false, message: "Participant not found" });
    }

    // 1. Evaluate only Milestones dynamically (Includes the new login/commit milestones)
    const newlyEarnedMilestones = await evaluateMilestoneBadges(participantId);

    // 2. Ranks badges are calculated at event end.

    const updatedParticipant = await Participant.findById(participantId);

    res.status(200).json({
      success: true,
      message: "Activity synchronized and milestones evaluated successfully.",
      data: {
        username: updatedParticipant.username,
        stats: updatedParticipant.stats,
        newlyEarnedMilestones: newlyEarnedMilestones.map(b => b.key),
        totalMilestonesEarned: updatedParticipant.badges.length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

/* decides the final top 3 rank badges */
async function finalizeEventRankings(req, res) {
  try {
    // Execute the leaderboard rank calculations once at the end of the event
    await updateRankBadges();

    // Fetch the final top 3 records to return confirmation data
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

    const participant = await Participant.findById(participantId);
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
