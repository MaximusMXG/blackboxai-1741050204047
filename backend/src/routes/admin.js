const express = require('express');
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');
const User = mongoose.model('User');
const Video = mongoose.model('Video');
const Brand = mongoose.model('Brand');
const Partnership = mongoose.model('Partnership');
const ActivityLog = require('../models/ActivityLog');
const router = express.Router();

// Custom middleware to check if user is an admin
const adminAuth = async (req, res, next) => {
    try {
        // User is already authenticated via auth middleware
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Development mode middleware - bypasses authentication checks
const devModeAuth = (req, res, next) => {
    // Check if we're in development mode
    if (process.env.NODE_ENV !== 'production') {
        // Create a mock admin user
        req.user = {
            _id: '000000000000000000000000', // Dummy ObjectId
            id: '000000000000000000000000',
            username: 'dev-admin',
            email: 'dev-admin@slice.com',
            isAdmin: true
        };
        return next();
    }
    
    // Otherwise, use the regular auth middleware
    auth(req, res, (err) => {
        if (err) return next(err);
        adminAuth(req, res, next);
    });
};

// Choose the correct middleware chain based on environment
const useAuth = process.env.NODE_ENV !== 'production' ? [devModeAuth] : [auth, adminAuth];

// Route to get admin dashboard overview data
router.get('/dashboard', useAuth, async (req, res) => {
    try {
        const now = new Date();
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        // Gather stats in parallel for efficiency
        const [
            totalUsers,
            newUsersThisWeek,
            newUsersThisMonth,
            totalVideos,
            newVideosThisWeek,
            newVideosThisMonth,
            totalBrands,
            pendingPartnerships,
            recentVideos,
            topVideos,
            activeUsers
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ createdAt: { $gte: lastWeek } }),
            User.countDocuments({ createdAt: { $gte: lastMonth } }),
            Video.countDocuments(),
            Video.countDocuments({ createdAt: { $gte: lastWeek } }),
            Video.countDocuments({ createdAt: { $gte: lastMonth } }),
            Brand.countDocuments(),
            Partnership.countDocuments({ status: 'pending' }),
            Video.find().sort('-createdAt').limit(5),
            Video.find().sort('-views').limit(5),
            User.find().sort('-lastActive').limit(5)
        ]);
        
        // Calculate engagement metrics
        const totalViews = await Video.aggregate([
            { $group: { _id: null, total: { $sum: '$views' } } }
        ]);
        
        // Get weekly view history for trend analysis
        const viewTrends = await Video.aggregate([
            { $unwind: '$viewsHistory' },
            { $match: { 'viewsHistory.date': { $gte: lastMonth } } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$viewsHistory.date' } },
                count: { $sum: '$viewsHistory.count' }
            }},
            { $sort: { _id: 1 } }
        ]);
        
        // Gather activity for audit log
        const recentActivity = await ActivityLog.find()
            .sort('-timestamp')
            .limit(20);
        
        res.json({
            users: {
                total: totalUsers,
                newThisWeek: newUsersThisWeek,
                newThisMonth: newUsersThisMonth
            },
            videos: {
                total: totalVideos,
                newThisWeek: newVideosThisWeek,
                newThisMonth: newVideosThisMonth,
                totalViews: totalViews.length > 0 ? totalViews[0].total : 0
            },
            brands: {
                total: totalBrands
            },
            partnerships: {
                pending: pendingPartnerships
            },
            viewTrends,
            recentVideos,
            topVideos,
            activeUsers,
            recentActivity
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ error: 'Error fetching admin dashboard data' });
    }
});

// Get all users with pagination and search
router.get('/users', useAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        
        let query = {};
        if (search) {
            query = {
                $or: [
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }
        
        const [users, total] = await Promise.all([
            User.find(query)
                .select('username email profilePicture slices isPremium createdAt')
                .sort('-createdAt')
                .skip(skip)
                .limit(limit),
            User.countDocuments(query)
        ]);
        
        res.json({
            users,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
});

// Get user details with watch history and notifications
router.get('/users/:id', useAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user details' });
    }
});

// Update user (admin action)
router.put('/users/:id', useAuth, async (req, res) => {
    try {
        const { isPremium, slices, isAdmin } = req.body;
        const updateData = {};
        
        // Only update fields that are provided
        if (isPremium !== undefined) updateData.isPremium = isPremium;
        if (slices !== undefined) updateData.slices = slices;
        if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Log this admin action
        await ActivityLog.create({
            userId: req.user.id,
            action: 'user_update',
            details: `Admin ${req.user.username} updated user ${user.username}`,
            targetId: user._id
        });
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error updating user' });
    }
});

// Suspend user
router.post('/users/:id/suspend', useAuth, async (req, res) => {
    try {
        const { reason, days } = req.body;
        const suspensionEnd = days ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : null;
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { 
                $set: { 
                    suspended: true,
                    suspensionReason: reason || 'Violation of platform terms',
                    suspensionEnd
                } 
            },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Log this admin action
        await ActivityLog.create({
            userId: req.user.id,
            action: 'user_suspend',
            details: `Admin ${req.user.username} suspended user ${user.username} for ${days || 'indefinite'} days`,
            targetId: user._id
        });
        
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: 'Error suspending user' });
    }
});

// Reinstate suspended user
router.post('/users/:id/reinstate', useAuth, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { suspended: false, suspensionReason: null, suspensionEnd: null } },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Log this admin action
        await ActivityLog.create({
            userId: req.user.id,
            action: 'user_reinstate',
            details: `Admin ${req.user.username} reinstated user ${user.username}`,
            targetId: user._id
        });
        
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: 'Error reinstating user' });
    }
});

// Get all videos with pagination and filtering
router.get('/videos', useAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const genre = req.query.genre;
        const flagged = req.query.flagged === 'true';
        
        let query = {};
        
        // Build the query based on filters
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { creator: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (genre && ['indie', 'mainstream', 'crowdfunding'].includes(genre)) {
            query.genre = genre;
        }
        
        if (flagged) {
            query.flagged = true;
        }
        
        const [videos, total] = await Promise.all([
            Video.find(query)
                .sort('-createdAt')
                .skip(skip)
                .limit(limit),
            Video.countDocuments(query)
        ]);
        
        res.json({
            videos,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching videos' });
    }
});

// Get video details
router.get('/videos/:id', useAuth, async (req, res) => {
    try {
        const video = await Video.findById(req.params.id)
            .populate('creatorId', 'username email');
        
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        
        res.json(video);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching video details' });
    }
});

// Update video (admin action)
router.put('/videos/:id', useAuth, async (req, res) => {
    try {
        const { title, description, tags, genre, featured, flagged } = req.body;
        const updateData = {};
        
        // Only update fields that are provided
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (tags !== undefined) updateData.tags = tags;
        if (genre !== undefined) updateData.genre = genre;
        if (featured !== undefined) updateData.featured = featured;
        if (flagged !== undefined) updateData.flagged = flagged;
        
        const video = await Video.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );
        
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        
        // Log this admin action
        await ActivityLog.create({
            userId: req.user.id,
            action: 'video_update',
            details: `Admin ${req.user.username} updated video ${video.title}`,
            targetId: video._id
        });
        
        res.json(video);
    } catch (error) {
        res.status(500).json({ error: 'Error updating video' });
    }
});

// Remove video
router.delete('/videos/:id', useAuth, async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        
        // Store video title for logging
        const videoTitle = video.title;
        
        // Delete the video
        await video.remove();
        
        // Log this admin action
        await ActivityLog.create({
            userId: req.user.id,
            action: 'video_delete',
            details: `Admin ${req.user.username} deleted video ${videoTitle}`,
            targetId: req.params.id
        });
        
        res.json({ success: true, message: 'Video deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting video' });
    }
});

// Get all partnership applications with pagination
router.get('/partnerships', useAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status;
        
        let query = {};
        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            query.status = status;
        }
        
        const [partnerships, total] = await Promise.all([
            Partnership.find(query)
                .populate('userId', 'username email')
                .sort('-createdAt')
                .skip(skip)
                .limit(limit),
            Partnership.countDocuments(query)
        ]);
        
        res.json({
            partnerships,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching partnerships' });
    }
});

// Approve or reject partnership application
router.put('/partnerships/:id', useAuth, async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        
        if (!status || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Valid status (approved/rejected) is required' });
        }
        
        // If rejecting, reason is required
        if (status === 'rejected' && !rejectionReason) {
            return res.status(400).json({ error: 'Rejection reason is required' });
        }
        
        const updateData = { status };
        if (status === 'rejected') {
            updateData.rejectionReason = rejectionReason;
        }
        
        const partnership = await Partnership.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        ).populate('userId', 'username email');
        
        if (!partnership) {
            return res.status(404).json({ error: 'Partnership application not found' });
        }
        
        // If approved, update user privileges
        if (status === 'approved') {
            await User.findByIdAndUpdate(
                partnership.userId._id,
                { $set: { isPartner: true } }
            );
            
            // Create notification for user
            await User.findByIdAndUpdate(
                partnership.userId._id,
                { $push: { 
                    notifications: {
                        message: 'Your partnership application has been approved! You now have creator privileges.',
                        type: 'system'
                    }
                }}
            );
        } else if (status === 'rejected') {
            // Create rejection notification
            await User.findByIdAndUpdate(
                partnership.userId._id,
                { $push: { 
                    notifications: {
                        message: `Your partnership application was not approved. Reason: ${rejectionReason}`,
                        type: 'system'
                    }
                }}
            );
        }
        
        // Log this admin action
        await ActivityLog.create({
            userId: req.user.id,
            action: `partnership_${status}`,
            details: `Admin ${req.user.username} ${status} partnership application for ${partnership.userId.username}`,
            targetId: partnership._id
        });
        
        res.json(partnership);
    } catch (error) {
        res.status(500).json({ error: 'Error updating partnership application' });
    }
});

// Get system logs with pagination and filtering
router.get('/logs', useAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const actionType = req.query.action;
        const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
        
        let query = {};
        
        if (actionType) {
            query.action = actionType;
        }
        
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = startDate;
            if (endDate) query.timestamp.$lte = endDate;
        }
        
        const [logs, total] = await Promise.all([
            ActivityLog.find(query)
                .populate('userId', 'username')
                .sort('-timestamp')
                .skip(skip)
                .limit(limit),
            ActivityLog.countDocuments(query)
        ]);
        
        res.json({
            logs,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching system logs' });
    }
});

module.exports = router;