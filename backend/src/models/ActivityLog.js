const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'login', 
            'logout', 
            'user_update', 
            'user_suspend', 
            'user_reinstate',
            'video_create', 
            'video_update', 
            'video_delete',
            'partnership_approved', 
            'partnership_rejected',
            'brand_create',
            'series_create'
        ]
    },
    details: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    ipAddress: {
        type: String,
        required: false
    },
    userAgent: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

// Index by timestamp for faster querying
activityLogSchema.index({ timestamp: -1 });

// Index by action for filtering
activityLogSchema.index({ action: 1 });

// Index by userId for user-specific logs
activityLogSchema.index({ userId: 1 });

// Method to log an activity
activityLogSchema.statics.logActivity = async function(data) {
    try {
        return await this.create(data);
    } catch (error) {
        console.error('Error logging activity:', error);
        return null;
    }
};

// Method to get recent logs
activityLogSchema.statics.getRecentLogs = async function(limit = 20) {
    return this.find()
        .sort('-timestamp')
        .limit(limit)
        .populate('userId', 'username');
};

// Method to get logs by action type
activityLogSchema.statics.getLogsByAction = async function(action, limit = 50) {
    return this.find({ action })
        .sort('-timestamp')
        .limit(limit)
        .populate('userId', 'username');
};

// Method to get logs by user
activityLogSchema.statics.getLogsByUser = async function(userId, limit = 50) {
    return this.find({ userId })
        .sort('-timestamp')
        .limit(limit);
};

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;