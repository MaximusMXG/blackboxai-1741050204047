const mongoose = require('mongoose');

const seriesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    brandId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        default: 'No description available',
        maxlength: 2000
    },
    coverImage: {
        type: String,
        default: 'https://picsum.photos/1200/300' // Default placeholder
    },
    coverImagePath: {
        type: String,
        default: null
    },
    trailer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        default: null
    },
    releaseDate: {
        type: Date,
        default: Date.now
    },
    tags: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'upcoming', 'cancelled'],
        default: 'active'
    },
    seasons: {
        type: Number,
        default: 1
    },
    episodesCount: {
        type: Number,
        default: 0
    },
    totalViews: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        enum: ['show', 'documentary', 'tutorial', 'vlog', 'podcast', 'other'],
        default: 'show'
    },
    genre: {
        type: String,
        required: true,
        enum: ['indie', 'mainstream', 'crowdfunding']
    },
    featured: {
        type: Boolean,
        default: false
    },
    isSeries: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Pre-save hook to generate slug if not provided
seriesSchema.pre('save', function(next) {
    if (this.isNew || this.isModified('title')) {
        if (!this.slug) {
            this.slug = this.title
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }
    }
    next();
});

// Virtual to populate episodes
seriesSchema.virtual('episodes', {
    ref: 'Video',
    localField: '_id',
    foreignField: 'seriesId',
    options: { sort: { 'episodeInfo.season': 1, 'episodeInfo.number': 1 } }
});

// Get episodes by season
seriesSchema.methods.getEpisodesBySeason = async function(season) {
    const Video = mongoose.model('Video');
    return Video.find({
        seriesId: this._id,
        'episodeInfo.season': season,
        status: 'published'
    }).sort('episodeInfo.number');
};

// Create season directory
seriesSchema.methods.createSeasonDirectory = async function(season) {
    const fs = require('fs').promises;
    const path = require('path');
    
    const Brand = mongoose.model('Brand');
    const brand = await Brand.findById(this.brandId);
    
    if (!brand) {
        throw new Error('Brand not found');
    }
    
    // Create directory structure
    const brandDirPath = path.join(process.cwd(), 'backend/storage/brands', brand.slug);
    const seriesDirPath = path.join(brandDirPath, 'series', this.slug);
    const seasonDirPath = path.join(seriesDirPath, `season-${season}`);
    
    try {
        // Ensure brand directory exists
        await fs.mkdir(brandDirPath, { recursive: true });
        
        // Create series subdirectory if it doesn't exist
        await fs.mkdir(path.join(brandDirPath, 'series'), { recursive: true });
        
        // Create series-specific directory
        await fs.mkdir(seriesDirPath, { recursive: true });
        
        // Create season directory
        await fs.mkdir(seasonDirPath, { recursive: true });
        
        return {
            brandDirPath,
            seriesDirPath,
            seasonDirPath,
            success: true
        };
    } catch (error) {
        console.error('Error creating season directory:', error);
        return {
            error: error.message,
            success: false
        };
    }
};

// Calculate total views for a series
seriesSchema.methods.updateTotalViews = async function() {
    const Video = mongoose.model('Video');
    const episodes = await Video.find({ seriesId: this._id });
    
    this.totalViews = episodes.reduce((sum, episode) => sum + episode.views, 0);
    this.episodesCount = episodes.length;
    
    return this.save();
};

// Get latest episode
seriesSchema.methods.getLatestEpisode = async function() {
    const Video = mongoose.model('Video');
    return Video.findOne({ 
        seriesId: this._id,
        status: 'published'
    })
    .sort('-episodeInfo.season -episodeInfo.number')
    .limit(1);
};

// Find series by slug
seriesSchema.statics.findBySlug = async function(slug) {
    return this.findOne({ slug });
};

const Series = mongoose.model('Series', seriesSchema);

module.exports = Series;