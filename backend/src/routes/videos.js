const express = require('express');
const Video = require('../models/Video');
const { auth } = require('../middleware/auth');
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

// Get video by ID with stats
router.get('/:id', async (req, res) => {
    try {
        const video = await Video.getWithStats(req.params.id);
        res.json(video);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Create new video (protected route)
router.post('/', auth, async (req, res) => {
    try {
        const { title, creator, thumbnail_url, genre } = req.body;
        const video = new Video({
            title,
            creator,
            thumbnail_url,
            genre
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

module.exports = router;
