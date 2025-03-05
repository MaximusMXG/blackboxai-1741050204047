const express = require('express');
const router = express.Router();
const SubscriptionSlice = require('../models/SubscriptionSlice');

// Allocate slices to a video
router.post('/', async (req, res) => {
    try {
        const { user_id, video_id, slices } = req.body;
        
        if (!user_id || !video_id || !slices) {
            return res.status(400).json({ 
                error: 'User ID, video ID, and number of slices are required' 
            });
        }

        if (slices < 0 || slices > 8) {
            return res.status(400).json({ 
                error: 'Slice allocation must be between 0 and 8' 
            });
        }

        const allocation = await SubscriptionSlice.allocateSlices(user_id, video_id, slices);
        res.status(201).json(allocation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get current slice allocation for a user-video pair
router.get('/user/:userId/video/:videoId', async (req, res) => {
    try {
        const { userId, videoId } = req.params;
        const slices = await SubscriptionSlice.getCurrentAllocation(userId, videoId);
        res.json({ slices });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update slice allocation
router.put('/user/:userId/video/:videoId', async (req, res) => {
    try {
        const { userId, videoId } = req.params;
        const { slices } = req.body;

        if (slices === undefined) {
            return res.status(400).json({ error: 'Number of slices is required' });
        }

        if (slices < 0 || slices > 8) {
            return res.status(400).json({ 
                error: 'Slice allocation must be between 0 and 8' 
            });
        }

        const result = await SubscriptionSlice.updateAllocation(userId, videoId, slices);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove slice allocation
router.delete('/user/:userId/video/:videoId', async (req, res) => {
    try {
        const { userId, videoId } = req.params;
        const result = await SubscriptionSlice.removeAllocation(userId, videoId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all subscriptions for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const subscriptions = await SubscriptionSlice.getUserSubscriptions(req.params.userId);
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
