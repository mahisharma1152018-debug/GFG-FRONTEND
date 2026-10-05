const express = require("express");
const { getRepositories } = require("../controllers/repositoryController.js");
const { getRepositoryMembers, getRepositoryLabels } = require("../controllers/rawDataController.js");
const Repository = require("../models/Repository.js");
const { getById } = require("../controllers/rawDataController.js");

const router = express.Router();

router.param("id", (req, res, next, value) => {
  if (!/^\d+$/.test(value)) {
    return res.status(400).json({ success: false, message: "Invalid repository id" });
  }
  next();
});

router.get("/", getRepositories);
router.get("/:id/members", getRepositoryMembers);
router.get("/:id/labels", getRepositoryLabels);
router.get("/:id", (req, res) => getById(req, res, Repository, "githubId"));

module.exports = router;
