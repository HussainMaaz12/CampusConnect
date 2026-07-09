const User = require('../models/User');



exports.grantPostPermission = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndUpdate(
            userId,
            { canPost: true },
            { new: true } 
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.status(200).json({
            success: true,
            message: `Success! ${user.username} can now post.`,
            user: { _id: user._id, username: user.username, canPost: user.canPost }
        });
    } catch (error) {
        console.error("Grant Permission Error:", error);
        res.status(500).json({ success: false, message: "Server error updating permissions." });
    }
};



exports.revokePostPermission = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndUpdate(
            userId,
            { canPost: false },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.status(200).json({
            success: true,
            message: `${user.username}'s posting rights have been revoked.`
        });
    } catch (error) {
        console.error("Revoke Permission Error:", error);
        res.status(500).json({ success: false, message: "Server error updating permissions." });
    }
};



exports.getAllUsers = async (req, res) => {
    try {
        
        const users = await User.find({ role: { $ne: 'admin' } }).select('name username email canPost avatar');
        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error("Fetch Users Error:", error);
        res.status(500).json({ success: false, message: "Server error fetching users." });
    }
};