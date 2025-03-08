const express = require('express');
const User = require('../models/User');
const Video = require('../models/Video');
const Subscription = require('../models/Subscription');
const SubscriptionSlice = require('../models/SubscriptionSlice');
const { auth } = require('../middleware/auth');
const router = express.Router();
const mongoose = require('mongoose');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const user = new User({ username, email, password });
        await user.save();
        
        const token = user.generateAuthToken();
        res.status(201).json({
            id: user._id,
            username: user.username,
            email: user.email,
            slices: user.slices,
            token
        });
    } catch (error) {
        if (error.code === 11000) { // MongoDB duplicate key error
            res.status(400).json({ error: 'Username or email already exists' });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        console.log('Login attempt received:', req.body);
        const { email, password } = req.body;
        
        if (!email || !password) {
            console.log('Missing email or password in request');
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        console.log('Checking if user exists with email:', email);
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('User not found with email:', email);
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        
        console.log('User found, checking password');
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        
        console.log('Password matched, generating token');
        const token = user.generateAuthToken();
        
        const userData = {
            id: user._id,
            username: user.username,
            email: user.email,
            slices: user.slices,
            token
        };
        
        console.log('Login successful, returning data:', userData);
        res.json(userData);
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(400).json({ error: error.message });
    }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching profile' });
    }
});

// Get user's slice allocation
router.get('/:id/slices', auth, async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ userId: req.params.id });
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching slice allocation' });
    }
});

// Get all slice allocations (for leaderboards/stats)
router.get('/slices/all', auth, async (req, res) => {
    try {
        const subscriptions = await Subscription.aggregate([
            {
                $group: {
                    _id: '$videoId',
                    totalSlices: { $sum: '$slices' }
                }
            },
            {
                $lookup: {
                    from: 'videos',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'videoDetails'
                }
            },
            { $unwind: '$videoDetails' },
            {
                $project: {
                    _id: 1,
                    totalSlices: 1,
                    title: '$videoDetails.title',
                    creator: '$videoDetails.creator',
                    thumbnail_url: '$videoDetails.thumbnail_url'
                }
            },
            { $sort: { totalSlices: -1 } }
        ]);
        
        res.json(subscriptions);
    } catch (error) {
        console.error('Error fetching all slice allocations:', error);
        res.status(500).json({ error: 'Error fetching slice allocations' });
    }
});

// Add slices to user account
router.post('/slices/add', auth, async (req, res) => {
    try {
        const { amount } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid slice amount' });
        }
        
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $inc: { slices: amount } },
            { new: true }
        );
        
        // Add notification
        await User.findByIdAndUpdate(req.user._id, {
            $push: {
                notifications: {
                    message: `You received ${amount} new slices!`,
                    type: 'slice'
                }
            }
        });
        
        res.json({
            slices: user.slices,
            message: `Successfully added ${amount} slices.`
        });
    } catch (error) {
        console.error('Error adding slices:', error);
        res.status(500).json({ error: 'Error adding slices' });
    }
});

// Allocate slices to a video
router.post('/slices/allocate', auth, async (req, res) => {
    try {
        const { videoId, sliceCount } = req.body;
        
        if (!videoId || !sliceCount || sliceCount <= 0) {
            return res.status(400).json({ error: 'Invalid allocation data' });
        }
        
        // Check if user has enough slices
        const user = await User.findById(req.user._id);
        if (user.slices < sliceCount) {
            return res.status(400).json({ error: 'Not enough slices available' });
        }
        
        // Check if video exists
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        
        // Start a session and transaction
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            // Find existing subscription
            let subscription = await Subscription.findOne({
                userId: req.user._id,
                videoId: videoId
            }).session(session);
            
            if (subscription) {
                // Update existing subscription
                subscription.slices += sliceCount;
                subscription.lastUpdated = new Date();
                await subscription.save({ session });
            } else {
                // Create new subscription
                subscription = new Subscription({
                    userId: req.user._id,
                    videoId: videoId,
                    slices: sliceCount,
                    active: true,
                    lastUpdated: new Date()
                });
                await subscription.save({ session });
            }
            
            // Create slice transaction record
            const sliceTransaction = new SubscriptionSlice({
                subscriptionId: subscription._id,
                userId: req.user._id,
                videoId: videoId,
                sliceCount: sliceCount,
                timestamp: new Date()
            });
            await sliceTransaction.save({ session });
            
            // Deduct slices from user
            await User.findByIdAndUpdate(
                req.user._id,
                { $inc: { slices: -sliceCount } },
                { session, new: true }
            );
            
            // Commit transaction
            await session.commitTransaction();
            session.endSession();
            
            res.json({
                message: `Successfully allocated ${sliceCount} slices to video`,
                remainingSlices: user.slices - sliceCount,
                subscriptionId: subscription._id
            });
        } catch (error) {
            // Abort transaction on error
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    } catch (error) {
        console.error('Error allocating slices:', error);
        res.status(500).json({ error: 'Error allocating slices' });
    }
});

// Get user's watch history
router.get('/history', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('watchHistory')
            .populate({
                path: 'watchHistory.videoId',
                select: 'title thumbnail_url creator duration genre'
            });
        
        // Format and sort by most recent
        const history = user.watchHistory
            .map(item => ({
                videoId: item.videoId._id,
                title: item.videoId.title,
                thumbnail: item.videoId.thumbnail_url,
                creator: item.videoId.creator,
                duration: item.videoId.duration,
                genre: item.videoId.genre,
                watchedAt: item.watchedAt,
                watchedDuration: item.watchedDuration
            }))
            .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));
        
        res.json(history);
    } catch (error) {
        console.error('Error fetching watch history:', error);
        res.status(500).json({ error: 'Error fetching watch history' });
    }
});

// Add to watch history
router.post('/history', auth, async (req, res) => {
    try {
        const { videoId, watchedDuration } = req.body;
        
        if (!videoId) {
            return res.status(400).json({ error: 'Video ID is required' });
        }
        
        // Check if video exists
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        
        // Check if video already in history
        const user = await User.findById(req.user._id);
        const existingEntry = user.watchHistory.find(
            item => item.videoId.toString() === videoId
        );
        
        if (existingEntry) {
            // Update existing entry
            await User.updateOne(
                {
                    _id: req.user._id,
                    'watchHistory.videoId': videoId
                },
                {
                    $set: {
                        'watchHistory.$.watchedAt': new Date(),
                        'watchHistory.$.watchedDuration': watchedDuration || existingEntry.watchedDuration,
                        'watchHistory.$.progress': (watchedDuration / (video.durationSeconds || 1)) * 100 || existingEntry.progress || 0,
                        'watchHistory.$.completed': (watchedDuration / (video.durationSeconds || 1)) >= 0.9 || existingEntry.completed || false,
                        'watchHistory.$.title': video.title,
                        'watchHistory.$.thumbnail': video.thumbnail_url,
                        'watchHistory.$.creator': video.creator,
                        'watchHistory.$.duration': video.duration,
                        'watchHistory.$.durationSeconds': video.durationSeconds,
                        'watchHistory.$.genre': video.genre
                    }
                }
            );
        } else {
            // Add new entry
            await User.findByIdAndUpdate(
                req.user._id,
                {
                    $push: {
                        watchHistory: {
                            videoId,
                            watchedAt: new Date(),
                            watchedDuration: watchedDuration || 0,
                            progress: 0,
                            completed: false,
                            title: video.title,
                            thumbnail: video.thumbnail_url,
                            creator: video.creator,
                            duration: video.duration,
                            durationSeconds: video.durationSeconds,
                            genre: video.genre
                        }
                    }
                }
            );
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating watch history:', error);
        res.status(500).json({ error: 'Error updating watch history' });
    }
});

// Get user notifications
router.get('/notifications', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('notifications');
        
        // Sort notifications by createdAt (newest first)
        const sortedNotifications = user.notifications.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        res.json(sortedNotifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Error fetching notifications' });
    }
});

// Mark notification as read
router.put('/notifications/:id/read', auth, async (req, res) => {
    try {
        await User.updateOne(
            {
                _id: req.user._id,
                'notifications._id': req.params.id
            },
            {
                $set: { 'notifications.$.read': true }
            }
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Error updating notification' });
    }
});

// Mark all notifications as read
router.put('/notifications/read/all', auth, async (req, res) => {
    try {
        await User.updateOne(
            { _id: req.user._id },
            { $set: { 'notifications.$[].read': true } }
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Error updating notifications' });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const allowedUpdates = ['username', 'bio', 'profilePicture', 'preferences'];
        const updates = {};
        
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });
        
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }
        
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');
        
        res.json(user);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Error updating profile' });
    }
});

// Get recommended videos for user
router.get('/recommended', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        // Get user's preferred genres if available
        const preferredGenres = user.preferences?.preferredGenres || ['indie', 'mainstream', 'crowdfunding'];
        
        // Get videos from user's watch history
        const watchedVideoIds = user.watchHistory.map(item => item.videoId);
        
        // Find recommended videos based on preferred genres and excluding watched videos
        const recommendations = await Video.find({
            _id: { $nin: watchedVideoIds },
            genre: { $in: preferredGenres }
        })
        .sort({ views: -1, trending: -1 })
        .limit(10);
        
        res.json(recommendations);
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({ error: 'Error fetching recommended videos' });
    }
});

module.exports = router;
