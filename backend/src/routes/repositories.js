const express = require("express");
const { getRepositories } = require("../controllers/repositoryController.js");
const { getRepositoryMembers, getRepositoryLabels } = require("../controllers/rawDataController.js");
const Repository = require("../models/Repository.js");
const { getById } = require("../controllers/rawDataController.js");

const router = express.Router();

router.get("/", getRepositories);
router.get("/:id/members", getRepositoryMembers);
router.get("/:id/labels", getRepositoryLabels);
router.get("/:id", (req, res) => getById(req, res, Repository, "githubId"));

module.exports = router;
