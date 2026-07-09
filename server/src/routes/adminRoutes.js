const express = require('express');
const router = express.Router();



const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');


const { grantPostPermission, revokePostPermission, getAllUsers } = require('../controllers/adminController');



router.get('/users', authMiddleware, requireAdmin, getAllUsers);
router.put('/grant/:userId', authMiddleware, requireAdmin, grantPostPermission);
router.put('/revoke/:userId', authMiddleware, requireAdmin, revokePostPermission);

module.exports = router;