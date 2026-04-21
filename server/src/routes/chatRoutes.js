const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getConversations, getChatHistory, sendMessage } = require("../controllers/chatController");

const router = express.Router();

router.get("/conversations", protect, getConversations);
router.get("/:userId", protect, getChatHistory);
router.post("/:userId", protect, sendMessage);

module.exports = router;
