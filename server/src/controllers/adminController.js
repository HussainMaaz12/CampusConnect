const User = require('../models/User');
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

    res.status(200).json({
        success: true,
        message: `${user.username}'s posting rights have been revoked.`
    });
});

exports.getAllUsers = asyncHandler(async (req, res) => {
    const { search } = req.query;
    
    let query = { role: { $ne: 'admin' } };
    
    if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
            { name: searchRegex },
            { username: searchRegex }
        ];
    }

    const users = await User.find(query).select('name username email canPost avatar');
    res.status(200).json({ success: true, users });
});