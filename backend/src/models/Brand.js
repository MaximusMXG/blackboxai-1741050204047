const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

// Brand social media links schema
const socialMediaSchema = new mongoose.Schema({
    platform: {
        type: String,
        enum: ['instagram', 'twitter', 'facebook', 'youtube', 'tiktok', 'linkedin', 'website', 'other'],
        required: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    followers: {
        type: Number,
        default: 0
    }
});

// Brand analytics schema
const analyticsSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    views: {
        type: Number,
        default: 0
    },
    sliceAllocation: {
        type: Number,
        default: 0
    },
    engagement: {
        type: Number,
        default: 0
    }
});

// Brand member/team schema
const memberSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['owner', 'admin', 'editor', 'analyst', 'viewer'],
        default: 'viewer'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    permissions: {
        canUpload: {
            type: Boolean,
            default: false
        },
        canEdit: {
            type: Boolean,
            default: false
        },
        canDelete: {
            type: Boolean,
            default: false
        },
        canInvite: {
            type: Boolean,
            default: false
        },
        canViewAnalytics: {
            type: Boolean,
            default: true
        }
    }
});

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: '',
        maxlength: 2000
    },
    shortDescription: {
        type: String,
        default: '',
        maxlength: 200
    },
    // Legacy URL fields (keeping for compatibility)
    logo: {
        type: String,
        default: 'https://picsum.photos/200' // Default placeholder image
    },
    coverImage: {
        type: String,
        default: 'https://picsum.photos/1200/300' // Default placeholder image
    },
    // File system paths
    logoPath: {
        type: String,
        default: null
    },
    coverImagePath: {
        type: String,
        default: null
    },
    assetsPath: {
        type: String,
        default: null
    },
    category: {
        type: String,
        enum: ['entertainment', 'music', 'gaming', 'education', 'sports', 'news', 'technology', 'lifestyle', 'food', 'travel', 'fashion', 'other'],
        default: 'entertainment'
    },
    tags: [{
        type: String,
        trim: true
    }],
    socialMedia: [socialMediaSchema],
    analytics: [analyticsSchema],
    members: [memberSchema],
    isVerified: {
        type: Boolean,
        default: false
    },
    totalSlicesReceived: {
        type: Number,
        default: 0
    },
    totalViews: {
        type: Number,
        default: 0
    },
    totalVideos: {
        type: Number,
        default: 0
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    followersCount: {
        type: Number,
        default: 0
    },
    stripeAccountId: {
        type: String,
        default: null
    },
    settings: {
        enableComments: {
            type: Boolean,
            default: true
        },
        autoPublish: {
            type: Boolean,
            default: false
        },
        storageQuota: {
            type: Number,
            default: 10 * 1024 * 1024 * 1024 // 10 GB in bytes
        },
        storageUsed: {
            type: Number,
            default: 0
        },
        notificationSettings: {
            email: {
                type: Boolean,
                default: true
            },
            newFollower: {
                type: Boolean,
                default: true
            },
            newComment: {
                type: Boolean,
                default: true
            },
            sliceAllocation: {
                type: Boolean,
                default: true
            }
        }
    },
    directoryCreated: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Pre-save hook to hash password
brandSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    
    // Auto-generate slug from name if not provided
    if (this.isNew || this.isModified('name')) {
        if (!this.slug) {
            this.slug = this.name
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }
    }
    
    // Update follower count
    if (this.isModified('followers')) {
        this.followersCount = this.followers.length;
    }
    
    next();
});

// Generate asset URLs
brandSchema.virtual('assetUrls').get(function() {
    const baseUrl = process.env.STORAGE_BASE_URL || 'http://localhost:3002/storage';
    
    return {
        logo: this.logoPath ? `${baseUrl}${this.logoPath}` : this.logo,
        cover: this.coverImagePath ? `${baseUrl}${this.coverImagePath}` : this.coverImage,
        assets: this.assetsPath ? `${baseUrl}${this.assetsPath}` : null
    };
});

// Compare password method
brandSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Get brand videos
brandSchema.methods.getVideos = async function(limit = 10, skip = 0, options = {}) {
    const Video = mongoose.model('Video');
    
    const query = { brandId: this._id };
    
    // Add additional query filters
    if (options.status) {
        query.status = options.status;
    }
    
    if (options.genre) {
        query.genre = options.genre;
    }
    
    // Add series filter
    if (options.seriesId) {
        query.seriesId = options.seriesId;
    } else if (options.includeSeriesVideos === false) {
        query.seriesId = { $exists: false };
    }
    
    return Video.find(query)
        .sort(options.sortBy || '-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('seriesId', 'title slug');
};

// Get brand series
brandSchema.methods.getSeries = async function(limit = 10, skip = 0) {
    const Series = mongoose.model('Series');
    return Series.find({ brandId: this._id })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit);
};

// Get brand analytics summary
brandSchema.statics.getAnalyticsSummary = async function(brandId) {
    const brand = await this.findById(brandId);
    if (!brand) {
        throw new Error('Brand not found');
    }
    
    // Calculate analytics for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAnalytics = brand.analytics.filter(a => a.date >= thirtyDaysAgo);
    const totalViews = recentAnalytics.reduce((sum, a) => sum + a.views, 0);
    const totalSlices = recentAnalytics.reduce((sum, a) => sum + a.sliceAllocation, 0);
    const totalEngagement = recentAnalytics.reduce((sum, a) => sum + a.engagement, 0);
    
    return {
        totalViews,
        totalSlices,
        totalEngagement,
        avgViewsPerDay: totalViews / 30,
        avgSlicesPerDay: totalSlices / 30,
        followerGrowth: brand.followersCount - (brand.followers.length - recentAnalytics.length) // Approximate
    };
};

// Find brand by slug
brandSchema.statics.findBySlug = async function(slug) {
    return this.findOne({ slug });
};

// Add analytics entry
brandSchema.methods.addAnalyticsEntry = async function(data) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if we already have an entry for today
    const existingEntryIndex = this.analytics.findIndex(
        entry => new Date(entry.date).setHours(0, 0, 0, 0) === today.getTime()
    );
    
    if (existingEntryIndex > -1) {
        // Update existing entry
        const existingEntry = this.analytics[existingEntryIndex];
        this.analytics[existingEntryIndex] = {
            ...existingEntry,
            views: existingEntry.views + (data.views || 0),
            sliceAllocation: existingEntry.sliceAllocation + (data.sliceAllocation || 0),
            engagement: existingEntry.engagement + (data.engagement || 0)
        };
    } else {
        // Add new entry
        this.analytics.push({
            date: today,
            views: data.views || 0,
            sliceAllocation: data.sliceAllocation || 0,
            engagement: data.engagement || 0
        });
    }
    
    await this.save();
    return this;
};

// Create brand directory structure
brandSchema.methods.createBrandDirectory = async function() {
    const brandDirPath = path.join(process.cwd(), 'backend/storage/brands', this.slug);
    
    try {
        // Create main brand directory
        await fs.mkdir(brandDirPath, { recursive: true });
        
        // Create subdirectories
        await fs.mkdir(path.join(brandDirPath, 'videos'), { recursive: true });
        await fs.mkdir(path.join(brandDirPath, 'series'), { recursive: true });
        await fs.mkdir(path.join(brandDirPath, 'assets'), { recursive: true });
        await fs.mkdir(path.join(brandDirPath, 'logos'), { recursive: true });
        await fs.mkdir(path.join(brandDirPath, 'covers'), { recursive: true });
        
        // Update brand paths
        this.assetsPath = `/brands/${this.slug}/assets`;
        this.directoryCreated = true;
        await this.save();
        
        return {
            brandDirPath,
            success: true
        };
    } catch (error) {
        console.error('Error creating brand directory:', error);
        return {
            error: error.message,
            success: false
        };
    }
};

// Update storage usage
brandSchema.methods.updateStorageUsage = async function() {
    const Video = mongoose.model('Video');
    const videos = await Video.find({ brandId: this._id });
    
    let totalSize = 0;
    for (const video of videos) {
        totalSize += video.fileSize || 0;
    }
    
    this.settings.storageUsed = totalSize;
    await this.save();
    
    return {
        storageUsed: this.settings.storageUsed,
        storageQuota: this.settings.storageQuota,
        usagePercentage: (this.settings.storageUsed / this.settings.storageQuota) * 100
    };
};

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;