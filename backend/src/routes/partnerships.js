const express = require('express');
const Partnership = require('../models/Partnership');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');
const router = express.Router();

// Get all partnerships (admin only)
router.get('/', auth, async (req, res) => {
    try {
        // TODO: Add admin check here in a real app
        const partnerships = await Partnership.getAll();
        res.json(partnerships);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching partnerships' });
    }
});

// Get partnerships by status (admin only)
router.get('/status/:status', auth, async (req, res) => {
    try {
        // TODO: Add admin check here in a real app
        const { status } = req.params;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const partnerships = await Partnership.getByStatus(status);
        res.json(partnerships);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching partnerships' });
    }
});

// Get partnerships for current user
router.get('/user', auth, async (req, res) => {
    try {
        const partnerships = await Partnership.getByUser(req.user.id);
        res.json(partnerships);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching partnerships' });
    }
});

// Get partnership by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const partnership = await Partnership.findById(req.params.id);
        
        if (!partnership) {
            return res.status(404).json({ error: 'Partnership not found' });
        }
        
        // Only allow users to access their own partnerships unless they're an admin
        // TODO: Add admin check here in a real app
        if (partnership.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to access this partnership' });
        }
        
        res.json(partnership);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching partnership' });
    }
});

// Submit a partnership application
router.post('/apply', auth, async (req, res) => {
    try {
        const { channelName, description, socialLinks, contentType, uploadFrequency } = req.body;
        
        // Check if user already has a pending application
        const existingApplication = await Partnership.findOne({
            userId: req.user.id,
            status: 'pending'
        });
        
        if (existingApplication) {
            return res.status(400).json({
                error: 'You already have a pending application',
                applicationId: existingApplication._id
            });
        }
        
        const partnership = new Partnership({
            userId: req.user.id,
            channelName,
            description,
            socialLinks,
            contentType,
            uploadFrequency
        });
        
        await partnership.save();
        
        // Add a notification to the user
        const user = await User.findById(req.user.id);
        user.notifications.push({
            message: `Your partnership application for "${channelName}" has been submitted and is under review.`,
            type: 'system'
        });
        await user.save();
        
        res.status(201).json({
            message: 'Partnership application submitted successfully',
            partnership
        });
    } catch (error) {
        res.status(400).json({
            error: 'Error submitting partnership application',
            details: error.message
        });
    }
});

// Approve a partnership application (admin only)
router.put('/:id/approve', auth, async (req, res) => {
    try {
        // TODO: Add admin check here in a real app
        const partnership = await Partnership.approve(req.params.id, req.user.id);
        
        // Add a notification to the user
        const user = await User.findById(partnership.userId);
        user.notifications.push({
            message: `Congratulations! Your partnership application for "${partnership.channelName}" has been approved.`,
            type: 'system',
            relatedId: partnership._id
        });
        await user.save();
        
        res.json({
            message: 'Partnership application approved successfully',
            partnership
        });
    } catch (error) {
        res.status(400).json({
            error: 'Error approving partnership application',
            details: error.message
        });
    }
});

// Reject a partnership application (admin only)
router.put('/:id/reject', auth, async (req, res) => {
    try {
        // TODO: Add admin check here in a real app
        const { rejectionReason } = req.body;
        
        if (!rejectionReason) {
            return res.status(400).json({ error: 'Rejection reason is required' });
        }
        
        const partnership = await Partnership.reject(req.params.id, rejectionReason);
        
        // Add a notification to the user
        const user = await User.findById(partnership.userId);
        user.notifications.push({
            message: `Your partnership application for "${partnership.channelName}" has been rejected.`,
            type: 'system',
            relatedId: partnership._id
        });
        await user.save();
        
        res.json({
            message: 'Partnership application rejected successfully',
            partnership
        });
    } catch (error) {
        res.status(400).json({
            error: 'Error rejecting partnership application',
            details: error.message
        });
    }
});

module.exports = router;