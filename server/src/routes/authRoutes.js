const express = require("express");
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { validate } = require('../middleware/validateMiddleware');
const { registerSchema, loginSchema } = require('../validators/authValidators');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many login/register attempts from this IP, please try again after 15 minutes"
});

const {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    getPublicProfile,
    toggleFollow,
    getSuggestions,
    googleLogin,
    setup2FA,
    verify2FA,
    refreshSession,
    logoutUser,
    getDirectory
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");


router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);
router.post("/google", googleLogin);
router.get("/profile/:username", getPublicProfile);


router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.put("/follow/:userId", protect, toggleFollow);
router.get("/suggestions", protect, getSuggestions);
router.get("/directory", protect, getDirectory);

router.post("/setup-2fa", protect, setup2FA);
router.post("/verify-2fa", authLimiter, verify2FA);
router.post("/refresh", refreshSession);
router.post("/logout", logoutUser);

module.exports = router;