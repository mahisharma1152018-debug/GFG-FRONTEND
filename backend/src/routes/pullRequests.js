const express = require("express");
const { getAllPullRequests, getPullRequestByNumber } = require("../controllers/pullRequestController.js");
const PullRequest = require("../models/PullRequest.js");
const { getById, getPRLabels, getPRLabelEvents, getPRReviews, getPRReviewComments } = require("../controllers/rawDataController.js");

const router = express.Router();

router.get("/", getAllPullRequests);
router.get("/:id/labels", getPRLabels);
router.get("/:id/label-events", getPRLabelEvents);
router.get("/:id/reviews", getPRReviews);
router.get("/:id/review-comments", getPRReviewComments);
router.get("/:id", (req, res) => getById(req, res, PullRequest, "githubPRId"));
router.get("/:owner/:repo/:number", getPullRequestByNumber);

module.exports = router;
