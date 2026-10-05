const express = require("express");
const { githubLogin, githubCallback, authMe, logout } = require("../controllers/authController.js");
const { authenticate } = require("../middleware/auth.js");

const router = express.Router();

router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);
router.get("/me", authenticate, authMe);
router.post("/logout", logout);

module.exports = router;
