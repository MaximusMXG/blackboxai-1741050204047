const mongoose = require('mongoose');

// Partnership Application Schema
const partnershipSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    channelName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    socialLinks: {
        type: String,
        trim: true
    },
    contentType: {
        type: String,
        enum: ['indie', 'mainstream', 'educational', 'entertainment'],
        default: 'indie'
    },
    uploadFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedAt: {
        type: Date
    },
    rejectionReason: {
        type: String
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Get all partnership applications
partnershipSchema.statics.getAll = async function() {
    return this.find().sort('-createdAt').populate('userId', 'username email profilePicture');
};

// Get applications by status
partnershipSchema.statics.getByStatus = async function(status) {
    return this.find({ status }).sort('-createdAt').populate('userId', 'username email profilePicture');
};

// Get applications by user
partnershipSchema.statics.getByUser = async function(userId) {
    return this.find({ userId }).sort('-createdAt');
};

// Approve an application
partnershipSchema.statics.approve = async function(applicationId, approvedBy) {
    const application = await this.findById(applicationId);
    if (!application) {
        throw new Error('Application not found');
    }
    
    application.status = 'approved';
    application.approvedAt = new Date();
    application.approvedBy = approvedBy;
    
    await application.save();
    return application;
};

// Reject an application
partnershipSchema.statics.reject = async function(applicationId, rejectionReason) {
    const application = await this.findById(applicationId);
    if (!application) {
        throw new Error('Application not found');
    }
    
    application.status = 'rejected';
    application.rejectionReason = rejectionReason;
    
    await application.save();
    return application;
};

const Partnership = mongoose.model('Partnership', partnershipSchema);

module.exports = Partnership;