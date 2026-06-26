const express = require("express");
const router = express.Router();


const { authLimiter } = require('../middleware/rateLimiter.middleware')
const { registerUser, loginUser, logoutUser } = require("../controllers/auth.controller");

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/logout", logoutUser);

module.exports = router;