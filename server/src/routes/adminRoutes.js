const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { validate } = require('../middleware/validateMiddleware');
const { permissionSchema, searchSchema } = require('../validators/adminValidators');

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
const { requireAdmin, requireSuperAdmin } = require('../middleware/adminMiddleware');

const { 
    grantPostPermission, 
    revokePostPermission, 
    getAllUsers, 
    getAuditLogs,
    getReports,
    updateReportStatus,
    getAnalytics,
    bulkUpdatePermissions,
    exportUsersCSV
} = require('../controllers/adminController');

router.get('/users', authMiddleware, requireAdmin, validate(searchSchema), getAllUsers);
router.get('/audit-logs', authMiddleware, requireSuperAdmin, getAuditLogs);
router.put('/grant/:userId', authMiddleware, requireAdmin, adminActionLimiter, validate(permissionSchema), adminActionLogger('grantPostPermission'), grantPostPermission);
router.put('/revoke/:userId', authMiddleware, requireAdmin, adminActionLimiter, validate(permissionSchema), adminActionLogger('revokePostPermission'), revokePostPermission);
router.get('/reports', authMiddleware, requireAdmin, getReports);
router.put('/reports/:id/status', authMiddleware, requireAdmin, adminActionLimiter, adminActionLogger('updateReportStatus'), updateReportStatus);
router.get('/analytics', authMiddleware, requireAdmin, getAnalytics);
router.put('/bulk-permissions', authMiddleware, requireSuperAdmin, adminActionLimiter, bulkUpdatePermissions);
router.get('/export-csv', authMiddleware, requireAdmin, exportUsersCSV);

module.exports = router;