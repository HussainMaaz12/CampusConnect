const Report = require('../models/Report');
const User = require('../models/User');
const Post = require('../models/Post');

const createReport = async (req, res) => {
    try {
        const { targetType, targetId, reason, details } = req.body;

        if (!targetType || !targetId || !reason) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Validate target exists
        if (targetType === 'User') {
            const user = await User.findById(targetId);
            if (!user) return res.status(404).json({ success: false, message: "Target user not found" });
        } else if (targetType === 'Post' || targetType === 'Comment') {
            // Depending on how comments are structured, we might just validate against Post
            const post = await Post.findById(targetType === 'Comment' ? req.body.postId || targetId : targetId);
            if (!post) return res.status(404).json({ success: false, message: "Target not found" });
        } else {
            return res.status(400).json({ success: false, message: "Invalid target type" });
        }

        // Check for existing pending report
        const existing = await Report.findOne({
            reporter: req.user._id,
            targetId,
            status: 'pending'
        });

        if (existing) {
            return res.status(400).json({ success: false, message: "You already have a pending report for this item" });
        }

        const report = await Report.create({
            reporter: req.user._id,
            targetType,
            targetId,
            reason,
            details
        });

        res.status(201).json({
            success: true,
            message: "Report submitted successfully",
            report
        });
    } catch (error) {
        console.error("Create report error:", error);
        res.status(500).json({ success: false, message: "Failed to submit report" });
    }
};

module.exports = {
    createReport
};
