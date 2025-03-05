const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    creator: {
        type: String,
        required: true,
        trim: true
    },
    thumbnail_url: {
        type: String,
        trim: true
    },
    genre: {
        type: String,
        required: true,
        enum: ['indie', 'mainstream', 'crowdfunding']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for getting total slices allocated to this video
videoSchema.virtual('totalSlices', {
    ref: 'Subscription',
    localField: '_id',
    foreignField: 'videoId',
    count: true
});

// Static method to get video with stats
videoSchema.statics.getWithStats = async function(videoId) {
    const video = await this.findById(videoId);
    if (!video) {
        throw new Error('Video not found');
    }

    await video.populate('totalSlices');
    return video;
};

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
