const express = require("express");
const router = express.Router();


const { authLimiter } = require("../middleware/rateLimiter.middleware");
const { validate } = require("../middleware/validate.middleware");
const { signUpSchema, loginSchema } = require("../validators/auth.validator");
const { registerUser, loginUser, logoutUser } = require("../controllers/auth.controller");

router.post("/register", authLimiter, validate(signUpSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);
router.post("/logout", logoutUser);

module.exports = router;