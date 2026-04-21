const Message = require("../models/Message");
const User = require("../models/User");

// @desc    Get all conversations for the logged-in user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;
        // Find all distinct users we've chatted with
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).sort({ createdAt: -1 });

        // Map them nicely to just unique users and last message
        const convos = new Map();
        
        for (let m of messages) {
            const partnerId = m.sender.toString() === userId.toString() ? m.receiver.toString() : m.sender.toString();
            if (!convos.has(partnerId)) {
                convos.set(partnerId, m);
            }
        }

        const populatedConvos = [];
        for (let [partnerId, lastMessage] of convos.entries()) {
            const partner = await User.findById(partnerId).select("name username avatar");
            populatedConvos.push({
                user: partner,
                lastMessage,
                unread: lastMessage.receiver.toString() === userId.toString() && !lastMessage.read
            });
        }

        res.status(200).json({ success: true, conversations: populatedConvos });
    } catch (error) {
        console.error("Get conversations error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get chat history with a specific user
// @route   GET /api/chat/:userId
// @access  Private
const getChatHistory = async (req, res) => {
    try {
        const myId = req.user._id;
        const targetId = req.params.userId;

        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: targetId },
                { sender: targetId, receiver: myId }
            ]
        }).sort({ createdAt: 1 });

        // Mark messages as read
        await Message.updateMany(
            { sender: targetId, receiver: myId, read: false },
            { $set: { read: true } }
        );

        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error("Get history error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Send a message
// @route   POST /api/chat/:userId
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { content } = req.body;
        const receiverId = req.params.userId;
        const senderId = req.user._id;

        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: "Message cannot be empty." });
        }

        const newMessage = await Message.create({
            sender: senderId,
            receiver: receiverId,
            content: content.trim(),
        });

        const io = req.app.get("io");
        const { emitToUser } = require("../socket");
        if (io && emitToUser) {
            emitToUser(io, receiverId, "chat:receive", newMessage);
            // Also notify them
            emitToUser(io, receiverId, "notification:new", { type: "message", message: "New message received", sender: req.user });
        }

        res.status(201).json({ success: true, message: newMessage });
    } catch (error) {
        console.error("Send message error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { getConversations, getChatHistory, sendMessage };
