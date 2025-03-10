const express = require('express');
const Brand = require('../models/Brand');
const User = require('../models/User');
const Video = require('../models/Video');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');
const router = express.Router();

// Get all brands (with pagination)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const brands = await Brand.find()
            .select('name logo description category followersCount totalVideos slug isVerified')
            .sort('-followersCount')
            .skip(skip)
            .limit(limit);
            
        const totalBrands = await Brand.countDocuments();
        
        res.json({
            brands,
            totalPages: Math.ceil(totalBrands / limit),
            currentPage: page,
            totalBrands
        });
    } catch (error) {
        console.error('Error fetching brands:', error);
        res.status(500).json({ error: 'Error fetching brands' });
    }
});

// Get brands by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const brands = await Brand.find({ category })
            .select('name logo description category followersCount totalVideos slug isVerified')
            .sort('-followersCount')
            .skip(skip)
            .limit(limit);
            
        const totalBrands = await Brand.countDocuments({ category });
        
        res.json({
            brands,
            totalPages: Math.ceil(totalBrands / limit),
            currentPage: page,
            totalBrands
        });
    } catch (error) {
        console.error('Error fetching brands by category:', error);
        res.status(500).json({ error: 'Error fetching brands by category' });
    }
});

// Get popular brands
router.get('/popular', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        const brands = await Brand.find({ isVerified: true })
            .select('name logo description category followersCount totalVideos slug')
            .sort('-followersCount')
            .limit(limit);
            
        res.json(brands);
    } catch (error) {
        console.error('Error fetching popular brands:', error);
        res.status(500).json({ error: 'Error fetching popular brands' });
    }
});

// Search brands
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        
        const brands = await Brand.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { tags: { $in: [new RegExp(q, 'i')] } }
            ]
        })
        .select('name logo description category followersCount totalVideos slug isVerified')
        .sort('-followersCount')
        .limit(10);
        
        res.json(brands);
    } catch (error) {
        console.error('Error searching brands:', error);
        res.status(500).json({ error: 'Error searching brands' });
    }
});

// Get brand by slug
router.get('/slug/:slug', async (req, res) => {
    try {
        // Changed to use findOne instead of the static method
        const brand = await Brand.findOne({ slug: req.params.slug })
            .select('-password -analytics -stripeAccountId');
            
        if (!brand) {
            return res.status(404).json({ error: 'Brand not found' });
        }
        
        // Increment view count in analytics
        await brand.addAnalyticsEntry({ views: 1 });
        
        res.json(brand);
    } catch (error) {
        console.error('Error fetching brand by slug:', error);
        res.status(500).json({ error: 'Error fetching brand by slug' });
    }
});

// Get brand by ID
router.get('/:id', async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id)
            .select('-password -analytics -stripeAccountId');
            
        if (!brand) {
            return res.status(404).json({ error: 'Brand not found' });
        }
        
        // Increment view count in analytics
        await brand.addAnalyticsEntry({ views: 1 });
        
        res.json(brand);
    } catch (error) {
        console.error('Error fetching brand:', error);
        res.status(500).json({ error: 'Error fetching brand' });
    }
});

// Get brand videos
router.get('/:id/videos', async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ error: 'Brand not found' });
        }
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const videos = await Video.find({ brandId: req.params.id })
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);
            
        const totalVideos = await Video.countDocuments({ brandId: req.params.id });
        
        res.json({
            videos,
            totalPages: Math.ceil(totalVideos / limit),
            currentPage: page,
            totalVideos
        });
    } catch (error) {
        console.error('Error fetching brand videos:', error);
        res.status(500).json({ error: 'Error fetching brand videos' });
    }
});

// Get brand followers
router.get('/:id/followers', async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ error: 'Brand not found' });
        }
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const followers = await User.find({ _id: { $in: brand.followers } })
            .select('username profilePicture bio slices')
            .skip(skip)
            .limit(limit);
            
        res.json({
            followers,
            totalPages: Math.ceil(brand.followersCount / limit),
            currentPage: page,
            totalFollowers: brand.followersCount
        });
    } catch (error) {
        console.error('Error fetching brand followers:', error);
        res.status(500).json({ error: 'Error fetching brand followers' });
    }
});

// Create a new brand (requires authentication)
router.post('/', auth, async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            description,
            shortDescription,
            category,
            tags
        } = req.body;
        
        // Check if brand with this name or email already exists
        const existingBrand = await Brand.findOne({
            $or: [
                { name },
                { email }
            ]
        });
        
        if (existingBrand) {
            return res.status(400).json({
                error: 'A brand with this name or email already exists'
            });
        }
        
        // Create new brand
        const brand = new Brand({
            name,
            email,
            password,
            description,
            shortDescription,
            category,
            tags: tags || [],
            members: [{
                userId: req.user.id,
                role: 'owner',
                permissions: {
                    canUpload: true,
                    canEdit: true,
                    canDelete: true,
                    canInvite: true,
                    canViewAnalytics: true
                }
            }]
        });
        
        await brand.save();
        
        // Return brand without sensitive information
        const brandToReturn = brand.toObject();
        delete brandToReturn.password;
        delete brandToReturn.stripeAccountId;
        
        res.status(201).json(brandToReturn);
    } catch (error) {
        console.error('Error creating brand:', error);
        res.status(400).json({ 
            error: 'Error creating brand',
            details: error.message
        });
    }
});

// Update brand details (requires authentication and ownership)
router.put('/:id', auth, async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ error: 'Brand not found' });
        }
        
        // Check if user is a member with edit permissions
        const member = brand.members.find(m => 
            m.userId.toString() === req.user.id && 
            (m.role === 'owner' || m.role === 'admin' || m.permissions.canEdit)
        );
        
        if (!member) {
            return res.status(403).json({ error: 'You do not have permission to update this brand' });
        }
        
        // Fields that can be updated
        const updateFields = [
            'name', 'description', 'shortDescription', 'logo', 'coverImage',
            'category', 'tags', 'socialMedia', 'settings'
        ];
        
        // Update fields
        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                brand[field] = req.body[field];
            }
        });
        
        await brand.save();
        
        // Return updated brand without sensitive information
        const brandToReturn = brand.toObject();
        delete brandToReturn.password;
        delete brandToReturn.stripeAccountId;
        
        res.json(brandToReturn);
    } catch (error) {
        console.error('Error updating brand:', error);
        res.status(400).json({ 
            error: 'Error updating brand',
            details: error.message
        });
    }
});

// Follow a brand (requires authentication)
router.post('/:id/follow', auth, async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ error: 'Brand not found' });
        }
        
        // Check if user is already following this brand
        if (brand.followers.includes(req.user.id)) {
            return res.status(400).json({ error: 'You are already following this brand' });
        }
        
        // Add user to followers
        brand.followers.push(req.user.id);
        await brand.save();
        
        // Add brand to user's following list (if you have that field in User model)
        const user = await User.findById(req.user.id);
        if (user && user.following) {
            user.following.push(req.params.id);
            await user.save();
        }
        
        res.json({
            success: true,
            followersCount: brand.followersCount
        });
    } catch (error) {
        console.error('Error following brand:', error);
        res.status(500).json({ error: 'Error following brand' });
    }
});

// Unfollow a brand (requires authentication)
router.post('/:id/unfollow', auth, async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ error: 'Brand not found' });
        }
        
        // Check if user is following this brand
        if (!brand.followers.includes(req.user.id)) {
            return res.status(400).json({ error: 'You are not following this brand' });
        }
        
        // Remove user from followers
        brand.followers = brand.followers.filter(
            follower => follower.toString() !== req.user.id
        );
        await brand.save();
        
        // Remove brand from user's following list (if you have that field in User model)
        const user = await User.findById(req.user.id);
        if (user && user.following) {
            user.following = user.following.filter(
                brandId => brandId.toString() !== req.params.id
            );
            await user.save();
        }
        
        res.json({
            success: true,
            followersCount: brand.followersCount
        });
    } catch (error) {
        console.error('Error unfollowing brand:', error);
        res.status(500).json({ error: 'Error unfollowing brand' });
    }
});

// Add a team member to brand (requires authentication and ownership)
router.post('/:id/members', auth, async (req, res) => {
    try {
        const { userId, role, permissions } = req.body;
        
        if (!userId || !role) {
            return res.status(400).json({ error: 'User ID and role are required' });
        }
        
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ error: 'Brand not found' });
        }
        
        // Check if user is a member with invite permissions
        const member = brand.members.find(m => 
            m.userId.toString() === req.user.id && 
            (m.role === 'owner' || m.role === 'admin' || m.permissions.canInvite)
        );
        
        if (!member) {
            return res.status(403).json({ error: 'You do not have permission to add members to this brand' });
        }
        
        // Check if user is already a member
        if (brand.members.some(m => m.userId.toString() === userId)) {
            return res.status(400).json({ error: 'User is already a member of this brand' });
        }
        
        // Check if user exists
        const userExists = await User.exists({ _id: userId });
        if (!userExists) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Add new member
        brand.members.push({
            userId,
            role,
            permissions: permissions || {
                canUpload: role === 'admin' || role === 'editor',
                canEdit: role === 'admin' || role === 'editor',
                canDelete: role === 'admin',
                canInvite: role === 'admin',
                canViewAnalytics: true
            }
        });
        
        await brand.save();
        
        res.status(201).json({
            success: true,
            member: brand.members[brand.members.length - 1]
        });
    } catch (error) {
        console.error('Error adding brand member:', error);
        res.status(500).json({ error: 'Error adding brand member' });
    }
});

// Remove a team member from brand (requires authentication and ownership)
router.delete('/:id/members/:userId', auth, async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ error: 'Brand not found' });
        }
        
        // Check if user is owner or admin
        const requestingMember = brand.members.find(m => 
            m.userId.toString() === req.user.id && 
            (m.role === 'owner' || m.role === 'admin')
        );
        
        if (!requestingMember) {
            return res.status(403).json({ error: 'You do not have permission to remove members from this brand' });
        }
        
        // Cannot remove owner if you're not the owner
        const memberToRemove = brand.members.find(m => m.userId.toString() === req.params.userId);
        if (!memberToRemove) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        if (memberToRemove.role === 'owner' && requestingMember.role !== 'owner') {
            return res.status(403).json({ error: 'Only the owner can remove themselves' });
        }
        
        // Remove member
        brand.members = brand.members.filter(m => m.userId.toString() !== req.params.userId);
        await brand.save();
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error removing brand member:', error);
        res.status(500).json({ error: 'Error removing brand member' });
    }
});

// Get brand analytics (requires authentication and membership)
router.get('/:id/analytics', auth, async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ error: 'Brand not found' });
        }
        
        // Check if user is a member with analytics permissions
        const member = brand.members.find(m => 
            m.userId.toString() === req.user.id && 
            (m.role === 'owner' || m.role === 'admin' || m.permissions.canViewAnalytics)
        );
        
        if (!member) {
            return res.status(403).json({ error: 'You do not have permission to view analytics for this brand' });
        }
        
        // Get analytics summary
        const summary = await Brand.getAnalyticsSummary(req.params.id);
        
        // Get detailed analytics for the requested time period
        const period = req.query.period || '30days';
        let startDate;
        
        switch (period) {
            case '7days':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '90days':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 90);
                break;
            case 'year':
                startDate = new Date();
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            case '30days':
            default:
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 30);
                break;
        }
        
        const detailedAnalytics = brand.analytics.filter(a => a.date >= startDate);
        
        res.json({
            summary,
            detailedAnalytics
        });
    } catch (error) {
        console.error('Error fetching brand analytics:', error);
        res.status(500).json({ error: 'Error fetching brand analytics' });
    }
});

module.exports = router;