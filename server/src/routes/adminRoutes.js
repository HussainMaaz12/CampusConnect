const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const adminActionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: "Too many admin actions requested from this IP, please try again after 15 minutes"
});

const adminActionLogger = (action) => {
    return (req, res, next) => {
        console.log(`[ADMIN ACTION] Admin ${req.user.id} is attempting to ${action} for user ${req.params.userId}`);
        next();
    };
};


const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');


const { grantPostPermission, revokePostPermission, getAllUsers } = require('../controllers/adminController');



router.get('/users', authMiddleware, requireAdmin, getAllUsers);
router.put('/grant/:userId', authMiddleware, requireAdmin, adminActionLimiter, adminActionLogger('grantPostPermission'), grantPostPermission);
router.put('/revoke/:userId', authMiddleware, requireAdmin, adminActionLimiter, adminActionLogger('revokePostPermission'), revokePostPermission);

module.exports = router;