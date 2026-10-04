const express = require("express");
const { listIssues, getById } = require("../controllers/rawDataController.js");
const Issue = require("../models/Issue.js");

const router = express.Router();

router.get("/", listIssues);
router.get("/:id", (req, res) => getById(req, res, Issue, "githubIssueId"));

module.exports = router;
