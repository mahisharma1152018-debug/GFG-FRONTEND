const express = require("express");
const { 
  getUser, 
  userContributions, 
  userPullRequests, 
  userReviews, 
  userComments, 
  userCommits, 
  userRepositories, 
  userActivity 
} = require("../controllers/userController.js");

const router = express.Router();

router.get("/:githubId", getUser);
router.get("/:githubId/contributions", userContributions);
router.get("/:githubId/pull-requests", userPullRequests);
router.get("/:githubId/reviews", userReviews);
router.get("/:githubId/comments", userComments);
router.get("/:githubId/commits", userCommits);
router.get("/:githubId/repositories", userRepositories);
router.get("/:githubId/activity", userActivity);

module.exports = router;
