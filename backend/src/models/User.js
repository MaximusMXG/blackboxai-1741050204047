const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Notification sub-schema
const notificationSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['system', 'subscription', 'slice', 'video'],
        default: 'system'
    },
    read: {
        type: Boolean,
        default: false
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    }
}, {
    timestamps: true
});

// Watch history sub-schema
const watchHistorySchema = new mongoose.Schema({
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true
    },
    watchedAt: {
        type: Date,
        default: Date.now
    },
    watchedDuration: {
        type: Number,
        default: 0
    },
    progress: {
        type: Number,
        default: 0
    },
    completed: {
        type: Boolean,
        default: false
    },
    title: String,
    thumbnail: String,
    creator: String,
    duration: String,
    durationSeconds: Number,
    genre: String
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profilePicture: {
        type: String,
        default: 'https://picsum.photos/200' // Default placeholder image
    },
    bio: {
        type: String,
        default: '',
        maxlength: 500
    },
    slices: {
        type: Number,
        default: 100
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    watchHistory: [watchHistorySchema],
    notifications: [notificationSchema],
    preferences: {
        autoplay: {
            type: Boolean,
            default: true
        },
        emailNotifications: {
            type: Boolean,
            default: true
        },
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system'
        },
        preferredGenres: [{
            type: String,
            enum: ['indie', 'mainstream', 'crowdfunding']
        }]
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Generate auth token
userSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
    );
};

// Compare password
userSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

// Static methods
userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email });
    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    const token = user.generateAuthToken();
    return {
        id: user._id,
        username: user.username,
        email: user.email,
        slices: user.slices,
        token
    };
};

// Get total slices a user has
userSchema.statics.getTotalSlices = async function(userId) {
    const user = await this.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return user.slices;
};

// Get currently used slices
userSchema.statics.getCurrentSlicesUsed = async function(userId) {
    const { sqliteDb } = require('../db/database');
    return new Promise((resolve, reject) => {
        const sql = 'SELECT SUM(slices) as total FROM subscription_slices WHERE user_id = ?';
        sqliteDb.get(sql, [userId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row && row.total ? row.total : 0);
            }
        });
    });
};

// Add slices to a user's balance
userSchema.statics.addSlices = async function(userId, amount) {
    if (amount <= 0) {
        throw new Error('Amount must be greater than zero');
    }
    
    const user = await this.findByIdAndUpdate(
        userId,
        { $inc: { slices: amount } },
        { new: true }
    );
    
    if (!user) {
        throw new Error('User not found');
    }
    
    // Add notification
    user.notifications.push({
        message: `You received ${amount} slices!`,
        type: 'slice'
    });
    
    await user.save();
    return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
