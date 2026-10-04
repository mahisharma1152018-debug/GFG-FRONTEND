const express = require("express");
const { getContributors, getContributor } = require("../controllers/contributorController.js");

const router = express.Router();

router.get("/", getContributors);
router.get("/:username", getContributor);

module.exports = router;
