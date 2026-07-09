const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    getPublicProfile,
    toggleFollow,
    getSuggestions,
    googleLogin,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");


router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.get("/profile/:username", getPublicProfile);


router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.put("/follow/:userId", protect, toggleFollow);
router.get("/suggestions", protect, getSuggestions);

module.exports = router;