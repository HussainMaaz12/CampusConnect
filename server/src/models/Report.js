const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetType: {
        type: String,
        enum: ['Post', 'User', 'Comment'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    details: {
        type: String,
        trim: true,
        maxLength: 500
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending'
    },
    actionTaken: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Prevent a user from reporting the same target multiple times while pending
reportSchema.index({ reporter: 1, targetId: 1, status: 1 });

module.exports = mongoose.model('Report', reportSchema);
