const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true
    },
    slices: {
        type: Number,
        required: true,
        min: 1
    }
}, {
    timestamps: true
});

// Compound index to ensure unique subscription per user-video pair
subscriptionSchema.index({ userId: 1, videoId: 1 }, { unique: true });

// Method to validate slice allocation
subscriptionSchema.statics.validateAllocation = async function(userId, slices) {
    const User = mongoose.model('User');
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    const currentSlices = await this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: '$slices' } } }
    ]);

    const usedSlices = currentSlices[0]?.total || 0;
    const availableSlices = user.slices - usedSlices;

    if (slices > availableSlices) {
        throw new Error(`Not enough slices available. You have ${availableSlices} slices remaining.`);
    }

    return true;
};

// Get user's subscriptions with video details
subscriptionSchema.statics.getUserSubscriptions = async function(userId) {
    return this.find({ userId })
        .populate('videoId', 'title creator thumbnail_url genre')
        .sort('-createdAt');
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
