const express = require("express");
const { listCommits, listReviews, listReviewComments, listIssueComments, listIssues, listContributions, getById } = require("../controllers/rawDataController.js");
const Commit = require("../models/Commit.js");
const Review = require("../models/Review.js");
const ReviewComment = require("../models/ReviewComment.js");
const IssueComment = require("../models/IssueComment.js");
const Issue = require("../models/Issue.js");

const router = express.Router();

router.get("/commits", listCommits);
router.get("/commits/:id", (req, res) => getById(req, res, Commit, "sha"));
router.get("/reviews", listReviews);
router.get("/reviews/:id", (req, res) => getById(req, res, Review, "githubReviewId"));
router.get("/review-comments", listReviewComments);
router.get("/review-comments/:id", (req, res) => getById(req, res, ReviewComment, "githubCommentId"));
router.get("/issue-comments", listIssueComments);
router.get("/issue-comments/:id", (req, res) => getById(req, res, IssueComment, "githubCommentId"));
router.get("/issues", listIssues);
router.get("/issues/:id", (req, res) => getById(req, res, Issue, "githubIssueId"));
router.get("/contributions", listContributions);

module.exports = router;
