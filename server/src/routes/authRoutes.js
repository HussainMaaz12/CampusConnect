const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    googleLogin,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);

// Private routes
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);

module.exports = router;