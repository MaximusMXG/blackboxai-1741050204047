const express = require('express');
const Video = require('../models/Video');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');
const router = express.Router();

// Get all videos
router.get('/', async (req, res) => {
    try {
        const videos = await Video.find()
            .sort('-createdAt')
            .populate('totalSlices');
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching videos' });
    }
});

// Get videos by genre
router.get('/genre/:genre', async (req, res) => {
    try {
        const { genre } = req.params;
        if (!['indie', 'mainstream', 'crowdfunding'].includes(genre)) {
            return res.status(400).json({ error: 'Invalid genre' });
        }
        
        const videos = await Video.find({ genre })
            .sort('-createdAt')
            .populate('totalSlices');
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: `Error fetching ${req.params.genre} videos` });
    }
});

// Get featured videos
router.get('/featured', async (req, res) => {
    try {
        const videos = await Video.find({ featured: true })
            .sort('-createdAt')
            .populate('totalSlices');
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching featured videos' });
    }
});

// Get trending videos
router.get('/trending', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const videos = await Video.getTrending(limit);
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching trending videos' });
    }
});

// Get recommended videos
router.get('/recommended', async (req, res) => {
    try {
        // A simple recommendation is to get videos with similar tags
        // to the ones the user has watched recently
        // In a real system, this would be more sophisticated
        const videos = await Video.find()
            .sort({ views: -1, createdAt: -1 })
            .limit(8);
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching recommended videos' });
    }
});

// Search videos
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        
        const videos = await Video.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { creator: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { tags: { $in: [new RegExp(q, 'i')] } }
            ]
        }).sort('-views');
        
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: 'Error searching videos' });
    }
});

// Get videos by tags
router.get('/tags', async (req, res) => {
    try {
        const { tags } = req.query;
        if (!tags) {
            return res.status(400).json({ error: 'Tags are required' });
        }
        
        const tagArray = tags.split(',').map(tag => tag.trim());
        const videos = await Video.find({
            tags: { $in: tagArray.map(tag => new RegExp(tag, 'i')) }
        }).sort('-createdAt');
        
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching videos by tags' });
    }
});

// Get related videos
router.get('/related/:id', async (req, res) => {
    try {
        console.log('Fetching related videos for:', req.params.id);
        const video = await Video.findById(req.params.id);
        
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        
        // Find videos with the same genre or similar tags
        const relatedVideos = await Video.find({
            _id: { $ne: video._id }, // Exclude the current video
            $or: [
                { genre: video.genre },
                { tags: { $in: video.tags } }
            ]
        })
        .sort('-views')
        .limit(8);
        
        console.log(`Found ${relatedVideos.length} related videos`);
        res.json(relatedVideos);
    } catch (error) {
        console.error('Error fetching related videos:', error);
        res.status(500).json({ error: 'Error fetching related videos' });
    }
});

// Get video by ID with stats
router.get('/:id', async (req, res) => {
    try {
        console.log('Fetching video with ID:', req.params.id);
        const video = await Video.getWithStats(req.params.id);
        console.log('Video found:', video.title);
        res.json(video);
    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(404).json({ 
            error: error.message,
            detail: 'Failed to retrieve video. Please check if the video ID exists.'
        });
    }
});

// Create new video (protected route)
router.post('/', auth, async (req, res) => {
    try {
        const {
            title,
            creator,
            thumbnail_url,
            video_url,
            genre,
            description,
            duration,
            durationSeconds,
            tags,
            featured
        } = req.body;
        
        const video = new Video({
            title,
            creator,
            creatorId: req.user.id,
            thumbnail_url,
            video_url: video_url || '',
            video_qualities: req.body.video_qualities || {
                '360p': '',
                '480p': '',
                '720p': '',
                '1080p': ''
            },
            genre,
            description: description || 'No description available',
            views: 0,
            duration: duration || '0:00',
            durationSeconds: durationSeconds || 0,
            tags: tags || [],
            featured: featured || false,
            trending: 0,
            releaseDate: new Date()
        });
        
        await video.save();
        res.status(201).json(video);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get video stats
router.get('/:id/stats', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id).populate('totalSlices');
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        res.json({
            totalSlices: video.totalSlices || 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching video stats' });
    }
});

// Routes were duplicated and have been removed

// Increment video view count and create a watch session
router.post('/:id/view', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        
        // Increment view count
        video.views += 1;
        
        // Update views history
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
        
        // Create a unique session ID for this view
        const sessionId = new mongoose.Types.ObjectId();
        
        await video.save();
        res.json({
            success: true,
            views: video.views,
            sessionId: sessionId
        });
    } catch (error) {
        res.status(500).json({ error: 'Error updating video view count' });
    }
});

// Rate a video
router.post('/:id/rate', auth, async (req, res) => {
    try {
        const { rating } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        
        const video = await Video.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        
        // Check if user already rated this video
        const existingRatingIndex = video.ratings.findIndex(
            r => r.userId.toString() === req.user.id
        );
        
        if (existingRatingIndex > -1) {
            // Update existing rating
            video.ratings[existingRatingIndex].value = rating;
        } else {
            // Add new rating
            video.ratings.push({
                userId: req.user.id,
                value: rating
            });
        }
        
        await video.save();
        res.json({
            success: true,
            averageRating: video.averageRating,
            totalRatings: video.ratings.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Error rating video' });
    }
});

// Add comment to video
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const { comment } = req.body;
        if (!comment) {
            return res.status(400).json({ error: 'Comment is required' });
        }
        
        const video = await Video.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        
        video.comments.push({
            userId: req.user.id,
            username: req.user.username,
            content: comment
        });
        
        await video.save();
        
        const newComment = video.comments[video.comments.length - 1];
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ error: 'Error adding comment' });
    }
});

// Get video comments
router.get('/:id/comments', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id)
            .select('comments')
            .populate('comments.userId', 'username profilePicture');
            
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        
        res.json(video.comments);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching comments' });
    }
});

// Update video watch progress
router.post('/:id/progress', auth, async (req, res) => {
    try {
        const { progress, currentTime, completed } = req.body;
        const userId = req.user.id;
        const videoId = req.params.id;
        
        if (progress === undefined || currentTime === undefined) {
            return res.status(400).json({ error: 'Progress and currentTime are required' });
        }
        
        // Find the user to update their watch history
        const User = mongoose.model('User');
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Find the video to make sure it exists
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        
        // Check if the video is already in the user's watch history
        const watchHistoryIndex = user.watchHistory.findIndex(
            item => item.videoId.toString() === videoId
        );
        
        if (watchHistoryIndex > -1) {
            // Update existing watch history
            user.watchHistory[watchHistoryIndex].progress = progress;
            user.watchHistory[watchHistoryIndex].watchedDuration = currentTime;
            user.watchHistory[watchHistoryIndex].watchedAt = new Date();
            user.watchHistory[watchHistoryIndex].completed = completed || false;
        } else {
            // Add to watch history
            user.watchHistory.push({
                videoId,
                watchedAt: new Date(),
                watchedDuration: currentTime,
                progress,
                completed: completed || false,
                title: video.title,
                thumbnail: video.thumbnail_url,
                creator: video.creator,
                duration: video.duration,
                durationSeconds: video.durationSeconds,
                genre: video.genre
            });
        }
        
        // Ensure the watch history doesn't grow too large (keep most recent 100 entries)
        if (user.watchHistory.length > 100) {
            user.watchHistory = user.watchHistory
                .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt))
                .slice(0, 100);
        }
        
        await user.save();
        
        res.json({
            success: true,
            message: 'Watch progress updated successfully'
        });
    } catch (error) {
        console.error('Error updating watch progress:', error);
        res.status(500).json({ error: 'Error updating watch progress' });
    }
});

module.exports = router;
