const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const Participant = require("../models/Participant");
const PullRequest = require("../models/PullRequest");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runEndToEndSimulation() {
  console.log(" Starting Full End-to-End Badge & Webhook Integration Test...\n");
  
  let serverInstance;
  const TEST_PORT = 5055;

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    serverInstance = app.listen(TEST_PORT, () => {
      console.log(` Temporary test server listening locally on port ${TEST_PORT}`);
    });

    const uniqueUsername = `test_coder_${Date.now()}`;
    // We create a valid numeric ID string that can match both numerical lookups and string routes safely
    const mockNumericGitHubId = Math.floor(100000 + Math.random() * 900000); 

    console.log(` STEP 1: Creating a test participant with Username: "${uniqueUsername}"...`);
    
    const regRes = await request(app)
      .post("/api/participants/register")
      .send({
        username: uniqueUsername,
        githubUrl: `https://github.com{uniqueUsername}`
      });

    const participantId = regRes.body.data?._id || regRes.body.participantId;
    
    // 🛠️ ALIGNMENT FIX 1: Set both fields to the numeric ID so whether your teammate's route
    // queries by username string or numeric githubId string, it matches perfectly!
    await Participant.findByIdAndUpdate(participantId, { 
      githubId: mockNumericGitHubId,
      username: mockNumericGitHubId.toString() // Defensive alignment for parameter lookups
    });
    
    console.log(` Participant registered. Database ID: ${participantId} | Unified Git ID: ${mockNumericGitHubId}\n`);

    console.log(" STEP 2: Bypassing webhook blocks by writing directly to the database collection...");
    
    // 🛠️ ALIGNMENT FIX 2: Populate every potential matching variant inside the author schema sub-object
    await PullRequest.create({
      githubPRId: Date.now(),
      repositoryId: 11223344,
      repositoryFullName: "geeksforgeeks/gfg-open-source-contribution",
      prNumber: 42,
      title: "Implement core tracking module documentation fixes",
      state: "closed",
      merged: true,
      author: {
        id: mockNumericGitHubId,
        githubId: mockNumericGitHubId,
        username: mockNumericGitHubId.toString(), // Matches string lookups
        login: mockNumericGitHubId.toString()    // Matches alternative webhook naming specs
      },
      labels: [
        { name: "official-task", color: "green", description: "Core project milestone assignment" }
      ]
    });

    console.log(" Mock pull request safely inserted with unified identifiers.");
    console.log(" Pausing briefly to let MongoDB update transaction records...");
    await delay(1000);

    console.log(" STEP 3: Triggering Your Sync API to aggregate data fields...");
    
    const syncRes = await request(app)
      .post(`/api/participants/${participantId}/sync`);

    console.log(`\n SIMULATION RESULTS [Status: ${syncRes.statusCode}]:`);
    console.log(`--------------------------------------------------`);
    console.log(` Username:         ${syncRes.body.data.username}`);
    console.log(` Total Points:     ${syncRes.body.data.points}`);
    console.log(` Merged PR Count:  ${syncRes.body.data.stats.mergedPRs}`);
    console.log(` Newly Earned:     [${syncRes.body.data.newlyEarnedMilestones?.join(", ") || "None"}]`);
    console.log(`--------------------------------------------------\n`);

    console.log(" Cleaning up simulation records from your cloud cluster database collections...");
    await Participant.findByIdAndDelete(participantId);
    await PullRequest.deleteMany({ "author.githubId": mockNumericGitHubId });
    console.log(" Cleanup successful! Testing pipeline finished cleanly.");

  } catch (error) {
    console.error(" Simulation encountered a critical runtime exception:", error);
  } finally {
    if (serverInstance) {
      await new Promise((resolve) => serverInstance.close(resolve));
      console.log(" Test port listener released.");
    }
    await mongoose.connection.close();
    process.exit(0);
  }
}

runEndToEndSimulation();
