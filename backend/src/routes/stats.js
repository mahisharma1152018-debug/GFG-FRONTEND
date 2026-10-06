const express = require("express");
const { getEventStats } = require("../controllers/statsController.js");

const router = express.Router();
router.get("/", getEventStats);

module.exports = router;
