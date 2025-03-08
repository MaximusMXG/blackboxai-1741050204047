const mongoose = require('mongoose');

// Comment schema
const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

// Rating schema
const ratingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    }
}, {
    timestamps: true
});

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
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    thumbnail_url: {
        type: String,
        trim: true
    },
    video_url: {
        type: String,
        trim: true
    },
    video_qualities: {
        '360p': { type: String, default: '' },
        '480p': { type: String, default: '' },
        '720p': { type: String, default: '' },
        '1080p': { type: String, default: '' }
    },
    genre: {
        type: String,
        required: true,
        enum: ['indie', 'mainstream', 'crowdfunding']
    },
    description: {
        type: String,
        default: 'No description available'
    },
    views: {
        type: Number,
        default: 0
    },
    viewsHistory: [{
        date: { type: Date, default: Date.now },
        count: { type: Number, default: 0 }
    }],
    duration: {
        type: String,
        default: '0:00'
    },
    durationSeconds: {
        type: Number,
        default: 0
    },
    tags: {
        type: [String],
        default: []
    },
    featured: {
        type: Boolean,
        default: false
    },
    trending: {
        type: Number,
        default: 0
    },
    releaseDate: {
        type: Date,
        default: Date.now
    },
    ratings: [ratingSchema],
    averageRating: {
        type: Number,
        default: 0
    },
    comments: [commentSchema],
    totalComments: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Calculate average rating when ratings are modified
videoSchema.pre('save', function(next) {
    if (this.ratings && this.ratings.length > 0) {
        const total = this.ratings.reduce((sum, rating) => sum + rating.value, 0);
        this.averageRating = (total / this.ratings.length).toFixed(1);
    } else {
        this.averageRating = 0;
    }
    
    // Update total comments count
    if (this.comments) {
        this.totalComments = this.comments.length;
    }
    
    next();
});

// Virtual for getting total slices allocated to this video
videoSchema.virtual('totalSlices', {
    ref: 'Subscription',
    localField: '_id',
    foreignField: 'videoId',
    count: false
});

videoSchema.virtual('sliceCount').get(function() {
    return this.totalSlices ? this.totalSlices.reduce((sum, sub) => sum + sub.slices, 0) : 0;
});

// Static method to get video with stats
videoSchema.statics.getWithStats = async function(videoId) {
    const video = await this.findById(videoId)
        .populate({
            path: 'totalSlices',
            select: 'slices userId'
        })
        .populate({
            path: 'comments.userId',
            select: 'username profilePicture'
        });
    
    if (!video) {
        throw new Error('Video not found');
    }
    
    // Increment view count
    video.views += 1;
    
    // Add to views history
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingEntry = video.viewsHistory.find(entry =>
        new Date(entry.date).setHours(0, 0, 0, 0) === today.getTime()
    );
    
    if (existingEntry) {
        existingEntry.count += 1;
    } else {
        video.viewsHistory.push({ date: today, count: 1 });
    }
    
    await video.save();
    
    return video;
};

// Static method to get trending videos
videoSchema.statics.getTrending = async function(limit = 10) {
    // Calculate trending score based on recent views and slice allocation
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return this.aggregate([
        {
            $match: {
                createdAt: { $gte: oneWeekAgo } // Only consider recent videos
            }
        },
        {
            $addFields: {
                recentViews: {
                    $filter: {
                        input: "$viewsHistory",
                        as: "history",
                        cond: { $gte: ["$$history.date", oneWeekAgo] }
                    }
                }
            }
        },
        {
            $addFields: {
                viewsCount: { $sum: "$recentViews.count" },
                trendingScore: {
                    $add: [
                        { $multiply: [{ $sum: "$recentViews.count" }, 1] },  // Views weight
                        { $multiply: ["$averageRating", 50] },               // Rating weight
                        { $multiply: ["$totalComments", 5] }                 // Comments weight
                    ]
                }
            }
        },
        { $sort: { trendingScore: -1 } },
        { $limit: limit }
    ]);
};

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
