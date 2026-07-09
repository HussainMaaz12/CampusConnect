const User = require('../models/User');

const roleLevels = {
    'user': 0,
    'student': 0,
    'moderator': 1,
    'admin': 2,
    'super-admin': 3
};

const checkRole = (requiredRole) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id || req.user._id);

            if (!user) {
                return res.status(401).json({ success: false, message: "User not found." });
            }

            const userLevel = roleLevels[user.role] || 0;
            const requiredLevel = roleLevels[requiredRole];

            if (userLevel < requiredLevel) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden: Insufficient permissions."
                });
            }

            
            if (requiredLevel >= 2 && !user.isTwoFactorEnabled) {
                return res.status(403).json({
                    success: false,
                    requires2FASetup: true,
                    message: "Forbidden: You must set up 2FA before accessing admin functionality."
                });
            }

            next();
        } catch (error) {
            console.error("Admin Middleware Error:", error);
            res.status(500).json({ success: false, message: "Server error checking permissions." });
        }
    };
};

module.exports = {
    requireModerator: checkRole('moderator'),
    requireAdmin: checkRole('admin'),
    requireSuperAdmin: checkRole('super-admin'),
};