const express = require("express");
const { listIssues, getById } = require("../controllers/rawDataController.js");
const Issue = require("../models/Issue.js");

const router = express.Router();

router.param("id", (req, res, next, value) => {
  if (!/^\d+$/.test(value)) {
    return res.status(400).json({ success: false, message: "Invalid issue id" });
  }
  next();
});

router.get("/", listIssues);
router.get("/:id", (req, res) => getById(req, res, Issue, "githubIssueId"));

module.exports = router;
