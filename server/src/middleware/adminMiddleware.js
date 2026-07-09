const User = require('../models/User');

const requireAdmin = async (req, res, next) => {
    try {

        const user = await User.findById(req.user.id || req.user._id);

        if (user && user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Only the Master Developer can perform this action."
            });
        }
    } catch (error) {
        console.error("Admin Middleware Error:", error);
        res.status(500).json({ success: false, message: "Server error checking permissions." });
    }
};

module.exports = { requireAdmin };