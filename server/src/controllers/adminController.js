const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/emailService');
const asyncHandler = require('express-async-handler');

exports.grantPostPermission = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
        userId,
        { canPost: true },
        { new: true } 
    );

    if (!user) {
        res.status(404);
        throw new Error("User not found.");
    }

    await AuditLog.create({
        actorId: req.user.id || req.user._id,
        targetId: user._id,
        action: 'GRANT_POST_PERMISSION',
        ipAddress: req.ip
    });

    await Notification.create({
        recipient: user._id,
        sender: req.user.id || req.user._id,
        type: 'permission_change',
        content: 'Your posting privileges have been granted! You can now create posts and stories.'
    });

    if (user.email) {
        sendEmail({
            to: user.email,
            subject: 'CampusConnect - Posting Privileges Granted',
            text: 'Good news! Your posting privileges on CampusConnect have been granted by an administrator. You can now start sharing posts and stories with the community.',
        }).catch(err => console.error("Failed to send grant email:", err));
    }

    res.status(200).json({
        success: true,
        message: `Success! ${user.username} can now post.`,
        user: { _id: user._id, username: user.username, canPost: user.canPost }
    });
});

exports.revokePostPermission = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
        userId,
        { canPost: false },
        { new: true }
    );

    if (!user) {
        res.status(404);
        throw new Error("User not found.");
    }

    await AuditLog.create({
        actorId: req.user.id || req.user._id,
        targetId: user._id,
        action: 'REVOKE_POST_PERMISSION',
        ipAddress: req.ip
    });

    await Notification.create({
        recipient: user._id,
        sender: req.user.id || req.user._id,
        type: 'permission_change',
        content: 'Your posting privileges have been revoked by an administrator.'
    });

    if (user.email) {
        sendEmail({
            to: user.email,
            subject: 'CampusConnect - Posting Privileges Revoked',
            text: 'Your posting privileges on CampusConnect have been revoked by an administrator. You are currently in read-only mode.',
        }).catch(err => console.error("Failed to send revoke email:", err));
    }

    res.status(200).json({
        success: true,
        message: `${user.username}'s posting rights have been revoked.`
    });
});

exports.getAllUsers = asyncHandler(async (req, res) => {
    const { search } = req.query;
    
    
    let query = { role: { $ne: 'super-admin' } };
    
    if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
            { name: searchRegex },
            { username: searchRegex }
        ];
    }

    const users = await User.find(query).select('name username email canPost avatar role');
    res.status(200).json({ success: true, users });
});

exports.getAuditLogs = asyncHandler(async (req, res) => {
    const logs = await AuditLog.find()
        .populate('actorId', 'name username')
        .populate('targetId', 'name username')
        .sort({ createdAt: -1 })
        .limit(100);

    res.status(200).json({ success: true, logs });
});

exports.getReports = asyncHandler(async (req, res) => {
    const reports = await Report.find()
        .populate('reporter', 'name username avatar')
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reports });
});

exports.updateReportStatus = asyncHandler(async (req, res) => {
    const { status, actionTaken } = req.body;
    
    const report = await Report.findById(req.params.id);
    if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = status || report.status;
    if (actionTaken !== undefined) {
        report.actionTaken = actionTaken;
    }

    await report.save();

    await AuditLog.create({
        actorId: req.user.id || req.user._id,
        targetId: report._id,
        action: 'UPDATE_REPORT',
        details: `Updated report status to ${report.status}`
    });

    await Notification.create({
        recipient: report.reporter,
        sender: req.user.id || req.user._id,
        type: 'report_status',
        content: `Your report regarding a ${report.targetType} has been marked as ${report.status}.`
    });

    const reporter = await User.findById(report.reporter);
    if (reporter && reporter.email) {
        sendEmail({
            to: reporter.email,
            subject: `CampusConnect - Report ${report.status}`,
            text: `Hello ${reporter.name},\n\nYour recent report concerning a ${report.targetType} has been updated to status: ${report.status}.\n\nThank you for helping keep CampusConnect safe.`,
        }).catch(err => console.error("Failed to send report update email:", err));
    }

    res.status(200).json({ success: true, report });
});

exports.getAnalytics = asyncHandler(async (req, res) => {
    const Post = require('../models/Post');

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [
        totalUsers,
        userGrowth,
        roleDistribution,
        postStats,
        categoryStats,
        activeUsers,
        recentAuditCount
    ] = await Promise.all([
        User.countDocuments(),

        User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]),

        User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]),

        Post.aggregate([
            {
                $group: {
                    _id: null,
                    totalPosts: { $sum: 1 },
                    totalLikes: { $sum: { $size: '$likes' } },
                    totalComments: { $sum: { $size: '$comments' } },
                    totalStories: {
                        $sum: { $cond: [{ $eq: ['$postType', 'story'] }, 1, 0] }
                    }
                }
            }
        ]),

        Post.aggregate([
            { $match: { postType: 'post' } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]),

        Post.distinct('author', {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }).then(ids => ids.length),

        AuditLog.countDocuments()
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const growthLabels = [];
    const growthData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = `${months[d.getMonth()]} ${d.getFullYear()}`;
        growthLabels.push(label);
        const match = userGrowth.find(
            g => g._id.year === d.getFullYear() && g._id.month === d.getMonth() + 1
        );
        growthData.push(match ? match.count : 0);
    }

    const engagement = postStats[0] || { totalPosts: 0, totalLikes: 0, totalComments: 0, totalStories: 0 };

    res.status(200).json({
        success: true,
        analytics: {
            totalUsers,
            activeUsersThisWeek: activeUsers,
            totalAuditActions: recentAuditCount,
            engagement,
            userGrowth: { labels: growthLabels, data: growthData },
            roleDistribution: roleDistribution.map(r => ({ role: r._id, count: r.count })),
            categoryStats: categoryStats.map(c => ({ category: c._id, count: c.count }))
        }
    });
});

exports.bulkUpdatePermissions = asyncHandler(async (req, res) => {
    const { userIds, action } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ success: false, message: 'No user IDs provided.' });
    }
    if (!['grant', 'revoke'].includes(action)) {
        return res.status(400).json({ success: false, message: 'Action must be "grant" or "revoke".' });
    }

    const canPost = action === 'grant';
    const result = await User.updateMany(
        { _id: { $in: userIds }, role: { $ne: 'super-admin' } },
        { $set: { canPost } }
    );

    const auditEntries = userIds.map(uid => ({
        actorId: req.user.id || req.user._id,
        targetId: uid,
        action: canPost ? 'BULK_GRANT_POST_PERMISSION' : 'BULK_REVOKE_POST_PERMISSION',
        ipAddress: req.ip,
        metadata: { bulkAction: true, totalAffected: userIds.length }
    }));
    await AuditLog.insertMany(auditEntries);

    res.status(200).json({
        success: true,
        message: `Bulk ${action} completed for ${result.modifiedCount} user(s).`,
        modifiedCount: result.modifiedCount
    });
});

exports.exportUsersCSV = asyncHandler(async (req, res) => {
    const { search } = req.query;
    let query = {};
    if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
            { name: searchRegex },
            { username: searchRegex },
            { email: searchRegex }
        ];
    }

    const users = await User.find(query)
        .select('name username email role canPost department year createdAt')
        .sort({ createdAt: -1 });

    const header = 'Name,Username,Email,Role,Can Post,Department,Year,Joined\n';
    const rows = users.map(u => {
        const joined = u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '';
        return `"${(u.name || '').replace(/"/g, '""')}","${u.username}","${u.email}","${u.role}","${u.canPost ? 'Yes' : 'No'}","${(u.department || '').replace(/"/g, '""')}","${u.year || ''}","${joined}"`;
    }).join('\n');

    await AuditLog.create({
        actorId: req.user.id || req.user._id,
        action: 'EXPORT_USERS_CSV',
        ipAddress: req.ip,
        metadata: { count: users.length }
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=campusconnect_users_${Date.now()}.csv`);
    res.status(200).send(header + rows);
});