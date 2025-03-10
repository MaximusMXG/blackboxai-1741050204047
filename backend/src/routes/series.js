const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Series = require('../models/Series');
const Video = require('../models/Video');
const Brand = require('../models/Brand');
const { auth } = require('../middleware/auth');
const path = require('path');
const fs = require('fs').promises;

// Get all series (with pagination)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const filter = {};
        
        // Filter by genre
        if (req.query.genre) {
            filter.genre = req.query.genre;
        }
        
        // Filter by status
        if (req.query.status) {
            filter.status = req.query.status;
        }
        
        // Filter by brand
        if (req.query.brand) {
            const brand = await Brand.findOne({ slug: req.query.brand });
            if (brand) {
                filter.brandId = brand._id;
            }
        }
        
        // Get total count for pagination
        const total = await Series.countDocuments(filter);
        
        // Get series
        const series = await Series.find(filter)
            .populate('brandId', 'name slug logo')
            .sort(req.query.sort || '-createdAt')
            .skip(skip)
            .limit(limit);
        
        res.json({
            total,
            page,
            pages: Math.ceil(total / limit),
            results: series
        });
    } catch (error) {
        console.error('Error fetching series:', error);
        res.status(500).json({ error: 'Error fetching series' });
    }
});

// Get series by slug
router.get('/slug/:slug', async (req, res) => {
    try {
        const series = await Series.findOne({ slug: req.params.slug })
            .populate('brandId', 'name slug logo');
        
        if (!series) {
            return res.status(404).json({ error: 'Series not found' });
        }
        
        // Get episodes count by season
        const episodes = await Video.find({ 
            seriesId: series._id,
            status: 'published'
        });
        
        // Calculate seasons data
        const seasonsMap = {};
        episodes.forEach(episode => {
            const season = episode.episodeInfo?.season || 1;
            if (!seasonsMap[season]) {
                seasonsMap[season] = [];
            }
            seasonsMap[season].push(episode);
        });
        
        const seasonsData = Object.keys(seasonsMap).map(season => ({
            season: parseInt(season),
            episodeCount: seasonsMap[season].length,
            totalViews: seasonsMap[season].reduce((sum, episode) => sum + episode.views, 0)
        }));
        
        res.json({
            ...series.toObject(),
            seasons: seasonsData,
            episodeCount: episodes.length
        });
    } catch (error) {
        console.error('Error fetching series:', error);
        res.status(500).json({ error: 'Error fetching series' });
    }
});

// Get series by ID
router.get('/:id', async (req, res) => {
    try {
        const series = await Series.findById(req.params.id)
            .populate('brandId', 'name slug logo');
        
        if (!series) {
            return res.status(404).json({ error: 'Series not found' });
        }
        
        res.json(series);
    } catch (error) {
        console.error('Error fetching series:', error);
        res.status(500).json({ error: 'Error fetching series' });
    }
});

// Get episodes for a series
router.get('/:id/episodes', async (req, res) => {
    try {
        const seriesId = req.params.id;
        
        // Validate series exists
        const series = await Series.findById(seriesId);
        if (!series) {
            return res.status(404).json({ error: 'Series not found' });
        }
        
        const filter = { 
            seriesId,
            status: 'published'
        };
        
        // Filter by season if provided
        if (req.query.season) {
            filter['episodeInfo.season'] = parseInt(req.query.season);
        }
        
        // Get episodes sorted by season and episode number
        const episodes = await Video.find(filter)
            .sort({
                'episodeInfo.season': 1,
                'episodeInfo.number': 1
            });
        
        res.json(episodes);
    } catch (error) {
        console.error('Error fetching episodes:', error);
        res.status(500).json({ error: 'Error fetching episodes' });
    }
});

// Create new series (auth required)
router.post('/', auth, async (req, res) => {
    try {
        const {
            title,
            brandId,
            description,
            genre,
            category,
            tags
        } = req.body;
        
        // Validate brand exists
        const brand = await Brand.findById(brandId);
        if (!brand) {
            return res.status(404).json({ error: 'Brand not found' });
        }
        
        // Check if user is member of brand
        const isBrandMember = brand.members.some(member => 
            member.userId.toString() === req.user._id.toString() &&
            ['owner', 'admin', 'editor'].includes(member.role)
        );
        
        // Allow admin users or brand members
        if (!req.user.isAdmin && !isBrandMember) {
            return res.status(403).json({ error: 'Not authorized to create series for this brand' });
        }
        
        // Create series
        const series = new Series({
            title,
            brandId,
            description,
            genre,
            category: category || 'show',
            tags: tags || []
        });
        
        await series.save();
        
        // Create directory structure for the series
        const directoryResult = await series.createSeasonDirectory(1);
        if (!directoryResult.success) {
            console.warn('Failed to create series directory:', directoryResult.error);
            // Continue anyway as this isn't critical
        }
        
        res.status(201).json(series);
    } catch (error) {
        console.error('Error creating series:', error);
        res.status(500).json({ error: 'Error creating series' });
    }
});

// Update series (auth required)
router.put('/:id', auth, async (req, res) => {
    try {
        const seriesId = req.params.id;
        
        // Validate series exists
        const series = await Series.findById(seriesId);
        if (!series) {
            return res.status(404).json({ error: 'Series not found' });
        }
        
        // Check if user is member of brand
        const brand = await Brand.findById(series.brandId);
        const isBrandMember = brand.members.some(member => 
            member.userId.toString() === req.user._id.toString() &&
            ['owner', 'admin', 'editor'].includes(member.role)
        );
        
        // Allow admin users or brand members
        if (!req.user.isAdmin && !isBrandMember) {
            return res.status(403).json({ error: 'Not authorized to update this series' });
        }
        
        // Fields that can be updated
        const allowedUpdates = [
            'title', 'description', 'coverImage', 'status',
            'tags', 'category', 'featured'
        ];
        
        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });
        
        // Update series
        const updatedSeries = await Series.findByIdAndUpdate(
            seriesId,
            { $set: updates },
            { new: true, runValidators: true }
        );
        
        res.json(updatedSeries);
    } catch (error) {
        console.error('Error updating series:', error);
        res.status(500).json({ error: 'Error updating series' });
    }
});

// Delete series (auth required)
router.delete('/:id', auth, async (req, res) => {
    try {
        const seriesId = req.params.id;
        
        // Validate series exists
        const series = await Series.findById(seriesId);
        if (!series) {
            return res.status(404).json({ error: 'Series not found' });
        }
        
        // Check if user is member of brand
        const brand = await Brand.findById(series.brandId);
        const isBrandOwner = brand.members.some(member => 
            member.userId.toString() === req.user._id.toString() &&
            ['owner', 'admin'].includes(member.role)
        );
        
        // Only allow admin users or brand owners
        if (!req.user.isAdmin && !isBrandOwner) {
            return res.status(403).json({ error: 'Not authorized to delete this series' });
        }
        
        // Find all videos in the series
        const videos = await Video.find({ seriesId });
        
        // Update videos to remove series association
        await Video.updateMany(
            { seriesId },
            { 
                $set: { 
                    seriesId: null,
                    isEpisode: false,
                    episodeInfo: null
                }
            }
        );
        
        // Delete series
        await Series.findByIdAndDelete(seriesId);
        
        res.json({ message: 'Series deleted successfully', videosUpdated: videos.length });
    } catch (error) {
        console.error('Error deleting series:', error);
        res.status(500).json({ error: 'Error deleting series' });
    }
});

// Add episode to series (auth required)
router.post('/:id/episodes', auth, async (req, res) => {
    try {
        const seriesId = req.params.id;
        const { videoId, season, number } = req.body;
        
        if (!videoId || !number) {
            return res.status(400).json({ error: 'Video ID and episode number are required' });
        }
        
        // Validate series exists
        const series = await Series.findById(seriesId);
        if (!series) {
            return res.status(404).json({ error: 'Series not found' });
        }
        
        // Validate video exists
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        
        // Check if video belongs to the same brand as the series
        if (video.brandId.toString() !== series.brandId.toString()) {
            return res.status(400).json({ error: 'Video belongs to a different brand' });
        }
        
        // Check if user is member of brand
        const brand = await Brand.findById(series.brandId);
        const isBrandMember = brand.members.some(member => 
            member.userId.toString() === req.user._id.toString() &&
            ['owner', 'admin', 'editor'].includes(member.role)
        );
        
        // Allow admin users or brand members
        if (!req.user.isAdmin && !isBrandMember) {
            return res.status(403).json({ error: 'Not authorized to add episodes to this series' });
        }
        
        // Check if episode number already exists for this season
        const existingEpisode = await Video.findOne({
            seriesId,
            'episodeInfo.season': season || 1,
            'episodeInfo.number': number
        });
        
        if (existingEpisode && existingEpisode._id.toString() !== videoId) {
            return res.status(400).json({ error: 'Episode number already exists for this season' });
        }
        
        // Update video
        video.seriesId = seriesId;
        video.isEpisode = true;
        video.episodeInfo = {
            season: season || 1,
            number: number,
            title: req.body.title || video.title
        };
        
        await video.save();
        
        // Update series seasons count if needed
        if ((season || 1) > series.seasons) {
            series.seasons = season || 1;
            await series.save();
            
            // Create season directory if it doesn't exist
            await series.createSeasonDirectory(season || 1);
        }
        
        // Update episode count
        await series.updateTotalViews();
        
        res.json(video);
    } catch (error) {
        console.error('Error adding episode:', error);
        res.status(500).json({ error: 'Error adding episode' });
    }
});

// Get trending series
router.get('/discover/trending', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        // Get series with most views in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const videos = await Video.aggregate([
            {
                $match: {
                    seriesId: { $ne: null },
                    'viewsHistory.date': { $gte: thirtyDaysAgo },
                    status: 'published'
                }
            },
            {
                $group: {
                    _id: '$seriesId',
                    totalViews: { $sum: '$views' },
                    episodeCount: { $sum: 1 }
                }
            },
            { $sort: { totalViews: -1 } },
            { $limit: limit }
        ]);
        
        // Get series details
        const seriesIds = videos.map(v => v._id);
        const seriesList = await Series.find({ 
            _id: { $in: seriesIds }
        }).populate('brandId', 'name slug logo');
        
        // Combine data
        const result = seriesList.map(series => {
            const stats = videos.find(v => v._id.toString() === series._id.toString());
            return {
                ...series.toObject(),
                totalViews: stats ? stats.totalViews : 0,
                episodeCount: stats ? stats.episodeCount : 0
            };
        }).sort((a, b) => b.totalViews - a.totalViews);
        
        res.json(result);
    } catch (error) {
        console.error('Error fetching trending series:', error);
        res.status(500).json({ error: 'Error fetching trending series' });
    }
});

module.exports = router;