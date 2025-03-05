const express = require('express');
const router = express.Router();
const Video = require('../models/Video');

// Create a new video
router.post('/', async (req, res) => {
    try {
        const { title, creator, thumbnail_url } = req.body;
        if (!title || !creator) {
            return res.status(400).json({ error: 'Title and creator are required' });
        }
        const video = await Video.create(title, creator, thumbnail_url);
        res.status(201).json(video);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all videos
router.get('/', async (req, res) => {
    try {
        const videos = await Video.getAll();
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get video by ID
router.get('/:id', async (req, res) => {
    try {
        const video = await Video.getById(req.params.id);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        res.json(video);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get video statistics (total slices and subscribers)
router.get('/:id/stats', async (req, res) => {
    try {
        const totalSlices = await Video.getTotalSlices(req.params.id);
        const subscribers = await Video.getSubscribers(req.params.id);
        
        res.json({
            total_slices: totalSlices,
            total_subscribers: subscribers.length,
            subscribers: subscribers
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
