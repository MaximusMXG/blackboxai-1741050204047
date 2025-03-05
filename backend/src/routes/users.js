const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email and password are required' });
        }
        const user = await User.create(username, email, password);
        res.status(201).json(user);
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            res.status(409).json({ error: 'Username or email already exists' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await User.login(email, password);
        res.json(user);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.getById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's slice allocation
router.get('/:id/slices', auth, async (req, res) => {
    try {
        const allocation = await User.getSliceAllocation(req.params.id);
        const totalSlices = await User.getTotalSlices(req.params.id);
        const usedSlices = await User.getCurrentSlicesUsed(req.params.id);
        
        res.json({
            total_slices: totalSlices,
            used_slices: usedSlices,
            available_slices: totalSlices - usedSlices,
            allocations: allocation
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
