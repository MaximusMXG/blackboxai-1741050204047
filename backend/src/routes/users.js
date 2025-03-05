const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

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
        const { email, password } = req.body;
        const userData = await User.login(email, password);
        res.json(userData);
    } catch (error) {
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
        const subscriptions = await Subscription.getUserSubscriptions(req.params.id);
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching slice allocation' });
    }
});

module.exports = router;
