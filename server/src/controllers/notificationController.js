const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate("sender", "name username avatar")
            .populate("post", "content postType")
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({ success: true, count: notifications.filter(n => !n.read).length, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const markAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({ success: true, message: "Marked all as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { getNotifications, markAsRead };
