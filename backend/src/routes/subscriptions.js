const express = require('express');
const Subscription = require('../models/Subscription');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Allocate slices to a video
router.post('/', auth, async (req, res) => {
    try {
        const { video_id, slices } = req.body;
        
        // Validate slice allocation
        await Subscription.validateAllocation(req.user._id, slices);

        const subscription = new Subscription({
            userId: req.user._id,
            videoId: video_id,
            slices
        });
        
        await subscription.save();
        await subscription.populate('videoId', 'title creator thumbnail_url genre');
        
        res.status(201).json(subscription);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get user's current allocation for a video
router.get('/user/:userId/video/:videoId', auth, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            userId: req.params.userId,
            videoId: req.params.videoId
        }).populate('videoId', 'title creator thumbnail_url genre');
        
        res.json(subscription || { slices: 0 });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching subscription' });
    }
});

// Update slice allocation
router.put('/user/:userId/video/:videoId', auth, async (req, res) => {
    try {
        const { slices } = req.body;
        
        // Validate slice allocation
        await Subscription.validateAllocation(req.params.userId, slices);

        const subscription = await Subscription.findOneAndUpdate(
            {
                userId: req.params.userId,
                videoId: req.params.videoId
            },
            { slices },
            { new: true }
        ).populate('videoId', 'title creator thumbnail_url genre');

        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        res.json(subscription);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Remove slice allocation
router.delete('/user/:userId/video/:videoId', auth, async (req, res) => {
    try {
        const subscription = await Subscription.findOneAndDelete({
            userId: req.params.userId,
            videoId: req.params.videoId
        });

        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        res.json({ message: 'Subscription removed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error removing subscription' });
    }
});

// Get all subscriptions for a user
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const subscriptions = await Subscription.getUserSubscriptions(req.params.userId);
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching subscriptions' });
    }
});

module.exports = router;
