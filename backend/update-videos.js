#!/usr/bin/env node
const mongoose = require('mongoose');
const { mongoConnection } = require('./src/db/database');
const fs = require('fs').promises;
const path = require('path');

// Import models
const Video = require('./src/models/Video');
const Brand = require('./src/models/Brand');
const User = require('./src/models/User');

// Sample video URLs from public sources with creative commons licenses
const SAMPLE_VIDEOS = [
    {
        title: "Colorful Smoke Animation",
        description: "Beautiful abstract colorful smoke animation with vibrant colors",
        genre: "mainstream",
        tags: ["animation", "abstract", "colorful", "smoke"],
        duration: "0:31",
        durationSeconds: 31,
        videoUrl: "https://www.pexels.com/video/colorful-smoke-3163534/",
        thumbnailUrl: "https://images.pexels.com/videos/3163534/free-video-3163534.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500"
    },
    {
        title: "Ocean Waves Breaking",
        description: "Relaxing footage of ocean waves breaking on a tropical beach",
        genre: "indie",
        tags: ["nature", "ocean", "waves", "relaxing"],
        duration: "0:24",
        durationSeconds: 24,
        videoUrl: "https://www.pexels.com/video/waves-rushing-to-the-shore-1409899/",
        thumbnailUrl: "https://images.pexels.com/videos/1409899/free-video-1409899.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500"
    },
    {
        title: "Drone City Flyover",
        description: "Aerial drone footage flying over a modern city skyline at sunset",
        genre: "mainstream",
        tags: ["drone", "city", "aerial", "skyline", "sunset"],
        duration: "0:45",
        durationSeconds: 45,
        videoUrl: "https://www.pexels.com/video/aerial-view-of-a-city-5168229/",
        thumbnailUrl: "https://images.pexels.com/videos/5168229/pexels-photo-5168229.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
    },
    {
        title: "Forest Adventure Game",
        description: "An indie game set in a mysterious forest with unique art style and puzzle mechanics",
        genre: "indie",
        tags: ["gaming", "forest", "puzzle", "art"],
        duration: "2:15",
        durationSeconds: 135,
        videoUrl: "https://www.pexels.com/video/video-of-forest-1448735/",
        thumbnailUrl: "https://images.pexels.com/videos/1448735/free-video-1448735.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500"
    },
    {
        title: "Support Our Documentary",
        description: "Help us fund this documentary about sustainable living practices around the world",
        genre: "crowdfunding",
        tags: ["documentary", "sustainability", "environment", "community"],
        duration: "3:10",
        durationSeconds: 190,
        videoUrl: "https://www.pexels.com/video/colorful-organic-farm-2144326/",
        thumbnailUrl: "https://images.pexels.com/videos/2144326/free-video-2144326.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500"
    }
];

// Function to ensure storage directories exist
async function ensureStorageDirectories() {
    const baseDir = path.join(__dirname, 'storage');
    const brandsDir = path.join(baseDir, 'brands');
    const videosDir = path.join(baseDir, 'videos');
    
    try {
        await fs.mkdir(baseDir, { recursive: true });
        await fs.mkdir(brandsDir, { recursive: true });
        await fs.mkdir(videosDir, { recursive: true });
        console.log('Storage directories created/confirmed');
        return true;
    } catch (error) {
        console.error('Error creating storage directories:', error);
        return false;
    }
}

// Function to find or create a brand
async function findOrCreateBrand() {
    try {
        // Try to find an existing brand
        let brand = await Brand.findOne();
        
        if (!brand) {
            console.log('No brands found, creating a default brand...');
            
            // Create a default brand
            brand = new Brand({
                name: 'Slice Studios',
                slug: 'slice-studios',
                email: 'studios@sliceplatform.com',
                password: 'password123', // This will be hashed by the model's pre-save hook
                description: 'Official content creator for the Slice platform.',
                shortDescription: 'Official Slice content',
                category: 'entertainment',
                tags: ['official', 'showcase', 'slice'],
                logoPath: '/brands/slice-studios/logos/default-logo.png',
                coverImagePath: '/brands/slice-studios/covers/default-cover.jpg'
            });
            
            await brand.save();
            console.log('Default brand created:', brand.name);
            
            // Create brand directories
            await brand.createBrandDirectory();
        } else {
            console.log('Using existing brand:', brand.name);
        }
        
        return brand;
    } catch (error) {
        console.error('Error finding/creating brand:', error);
        throw error;
    }
}

// Function to update existing videos
async function updateExistingVideos(brandId) {
    try {
        const videos = await Video.find();
        console.log(`Found ${videos.length} existing videos to update`);
        
        let updatedCount = 0;
        
        for (const video of videos) {
            // Check if the video needs updating (missing required fields)
            if (!video.filePath || !video.thumbnailPath || !video.brandId) {
                // Generate paths based on video title
                const slug = video.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
                const filePath = `/brands/slice-studios/videos/${slug}/${slug}.mp4`;
                const thumbnailPath = `/brands/slice-studios/videos/${slug}/${slug}-thumbnail.jpg`;
                
                // Update the video
                video.filePath = filePath;
                video.thumbnailPath = thumbnailPath;
                video.brandId = brandId;
                
                // Update quality paths if they don't exist
                if (!video.qualityPaths['720p']) {
                    video.qualityPaths = {
                        '360p': `/brands/slice-studios/videos/${slug}/qualities/${slug}-360p.mp4`,
                        '480p': `/brands/slice-studios/videos/${slug}/qualities/${slug}-480p.mp4`,
                        '720p': `/brands/slice-studios/videos/${slug}/qualities/${slug}-720p.mp4`,
                        '1080p': `/brands/slice-studios/videos/${slug}/qualities/${slug}-1080p.mp4`
                    };
                }
                
                await video.save();
                updatedCount++;
            }
        }
        
        console.log(`Updated ${updatedCount} videos with proper file paths and brand ID`);
    } catch (error) {
        console.error('Error updating existing videos:', error);
        throw error;
    }
}

// Function to create new example videos
async function createExampleVideos(brandId, creatorId) {
    try {
        const newVideos = [];
        
        for (const sampleVideo of SAMPLE_VIDEOS) {
            // Generate slug from title
            const slug = sampleVideo.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
            
            // Create video paths
            const filePath = `/brands/slice-studios/videos/${slug}/${slug}.mp4`;
            const thumbnailPath = `/brands/slice-studios/videos/${slug}/${slug}-thumbnail.jpg`;
            
            // Create new video document
            const newVideo = new Video({
                title: sampleVideo.title,
                creator: 'Slice Studios',
                creatorId: creatorId,
                brandId: brandId,
                genre: sampleVideo.genre,
                description: sampleVideo.description,
                tags: sampleVideo.tags,
                duration: sampleVideo.duration,
                durationSeconds: sampleVideo.durationSeconds,
                
                // File paths
                filePath: filePath,
                thumbnailPath: thumbnailPath,
                
                // External URLs (for compatibility)
                thumbnail_url: sampleVideo.thumbnailUrl,
                video_url: sampleVideo.videoUrl,
                
                // Quality paths
                qualityPaths: {
                    '360p': `/brands/slice-studios/videos/${slug}/qualities/${slug}-360p.mp4`,
                    '480p': `/brands/slice-studios/videos/${slug}/qualities/${slug}-480p.mp4`,
                    '720p': `/brands/slice-studios/videos/${slug}/qualities/${slug}-720p.mp4`,
                    '1080p': `/brands/slice-studios/videos/${slug}/qualities/${slug}-1080p.mp4`
                },
                
                // Video qualities (legacy)
                video_qualities: {
                    '360p': `http://localhost:3002/storage/brands/slice-studios/videos/${slug}/qualities/${slug}-360p.mp4`,
                    '480p': `http://localhost:3002/storage/brands/slice-studios/videos/${slug}/qualities/${slug}-480p.mp4`,
                    '720p': `http://localhost:3002/storage/brands/slice-studios/videos/${slug}/qualities/${slug}-720p.mp4`,
                    '1080p': `http://localhost:3002/storage/brands/slice-studios/videos/${slug}/qualities/${slug}-1080p.mp4`
                },
                
                // Additional metadata
                views: Math.floor(Math.random() * 50000) + 5000,
                viewsHistory: Array.from({ length: 7 }, (_, i) => ({
                    date: new Date(Date.now() - i * 86400000),
                    count: Math.floor(Math.random() * 100) + 1
                })),
                releaseDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000),
                trending: Math.floor(Math.random() * 100),
                featured: Math.random() > 0.7, // 30% chance of being featured
                
                // Status
                status: 'published',
                
                // File details
                fileSize: Math.floor(Math.random() * 500000000) + 50000000, // Random size between 50-550 MB
                fileFormat: 'mp4'
            });
            
            await newVideo.save();
            console.log(`Created example video: ${newVideo.title}`);
            newVideos.push(newVideo);
            
            // Create video directory structure
            await Video.createVideoDirectory(brandId, newVideo._id);
        }
        
        console.log(`Created ${newVideos.length} new example videos`);
    } catch (error) {
        console.error('Error creating example videos:', error);
        throw error;
    }
}

// Main function
async function main() {
    try {
        console.log('Starting video update process...');
        
        // Ensure storage directories exist
        await ensureStorageDirectories();
        
        // Connect to MongoDB
        mongoConnection.once('open', async () => {
            console.log('MongoDB connection established');
            
            try {
                // Find or create a brand
                const brand = await findOrCreateBrand();
                
                // Find a creator user
                let creator = await User.findOne({ username: 'creator' });
                if (!creator) {
                    creator = await User.findOne(); // Just get any user if 'creator' doesn't exist
                }
                
                if (!creator) {
                    throw new Error('No users found in the database');
                }
                
                // Update existing videos with proper paths and brand ID
                await updateExistingVideos(brand._id);
                
                // Create new example videos
                await createExampleVideos(brand._id, creator._id);
                
                console.log('Video update process completed successfully');
                
                // Disconnect and exit
                await mongoose.disconnect();
                console.log('MongoDB disconnected');
                process.exit(0);
            } catch (error) {
                console.error('Error in main process:', error);
                process.exit(1);
            }
        });
        
        // Handle connection errors
        mongoConnection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            process.exit(1);
        });
        
        // Set a timeout in case connection takes too long
        setTimeout(() => {
            console.error('Connection timeout - MongoDB connection took too long');
            process.exit(1);
        }, 30000); // 30 seconds timeout
        
        console.log('Waiting for MongoDB connection...');
    } catch (error) {
        console.error('Error in main process:', error);
        process.exit(1);
    }
}

// Run the main function
main();