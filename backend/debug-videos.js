#!/usr/bin/env node
const mongoose = require('mongoose');
const { mongoConnection } = require('./src/db/database');
const fs = require('fs').promises;
const path = require('path');
const http = require('http');

// Import models
const Video = require('./src/models/Video');
const Brand = require('./src/models/Brand');

// Function to test video API endpoint
async function testVideoEndpoint(videoId) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3002,
            path: `/api/videos/${videoId}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve({
                        status: res.statusCode,
                        data: response
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        error: 'Failed to parse JSON',
                        raw: data
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.end();
    });
}

// Function to debug and fix video issues
async function debugVideos() {
    try {
        console.log('Starting video debugging process...');
        
        // Fetch all videos
        const videos = await Video.find();
        console.log(`Found ${videos.length} videos to inspect`);
        
        // Check for critical issues in each video
        const issuesFound = [];
        const repaired = [];
        
        for (const video of videos) {
            const issues = [];
            
            // Check required fields
            if (!video.title) issues.push('Missing title');
            if (!video.creator) issues.push('Missing creator');
            if (!video.genre) issues.push('Missing genre');
            
            // Check brand association
            if (!video.brandId) {
                issues.push('Missing brandId');
                
                // Try to find default brand
                const brand = await Brand.findOne({ slug: 'slice-studios' });
                if (brand) {
                    video.brandId = brand._id;
                    repaired.push(`Fixed missing brandId for video ${video.title}`);
                }
            }
            
            // Check required file paths
            if (!video.filePath) {
                issues.push('Missing filePath');
                
                // Generate a default file path
                const slug = video.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
                video.filePath = `/brands/slice-studios/videos/${slug}/${slug}.mp4`;
                repaired.push(`Fixed missing filePath for video ${video.title}`);
            }
            
            if (!video.thumbnailPath) {
                issues.push('Missing thumbnailPath');
                
                // Generate a default thumbnail path
                const slug = video.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
                video.thumbnailPath = `/brands/slice-studios/videos/${slug}/${slug}-thumbnail.jpg`;
                repaired.push(`Fixed missing thumbnailPath for video ${video.title}`);
            }
            
            // Check quality paths
            const hasEmptyQualityPaths = Object.values(video.qualityPaths).every(path => !path);
            if (hasEmptyQualityPaths) {
                issues.push('Missing quality paths');
                
                // Generate quality paths
                const slug = video.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
                video.qualityPaths = {
                    '360p': `/brands/slice-studios/videos/${slug}/qualities/${slug}-360p.mp4`,
                    '480p': `/brands/slice-studios/videos/${slug}/qualities/${slug}-480p.mp4`,
                    '720p': `/brands/slice-studios/videos/${slug}/qualities/${slug}-720p.mp4`,
                    '1080p': `/brands/slice-studios/videos/${slug}/qualities/${slug}-1080p.mp4`
                };
                repaired.push(`Fixed missing quality paths for video ${video.title}`);
            }
            
            // If any issues were found, save the fixes
            if (issues.length > 0) {
                issuesFound.push({
                    videoId: video._id,
                    title: video.title,
                    issues
                });
                
                // Save the fixed video
                await video.save();
                console.log(`Fixed issues with video: ${video.title}`);
            }
            
            // Test the video API endpoint
            console.log(`Testing API endpoint for video ${video._id}...`);
            try {
                const response = await testVideoEndpoint(video._id);
                if (response.status !== 200) {
                    console.log(`API test failed for video ${video._id}:`, response);
                } else {
                    console.log(`API test successful for video ${video._id}`);
                }
            } catch (error) {
                console.error(`API test error for video ${video._id}:`, error.message);
            }
        }
        
        // Print summary
        console.log('\n====== VIDEO DEBUG SUMMARY ======');
        console.log(`Total videos: ${videos.length}`);
        console.log(`Videos with issues: ${issuesFound.length}`);
        console.log(`Repairs made: ${repaired.length}`);
        
        if (issuesFound.length > 0) {
            console.log('\nIssues found:');
            issuesFound.forEach(issue => {
                console.log(`- Video "${issue.title}" (${issue.videoId}): ${issue.issues.join(', ')}`);
            });
        }
        
        if (repaired.length > 0) {
            console.log('\nRepairs made:');
            repaired.forEach(repair => {
                console.log(`- ${repair}`);
            });
        }
        
        console.log('\nDebugging complete!');
    } catch (error) {
        console.error('Error during video debugging:', error);
    }
}

// Add debugging to the videos route
async function patchVideosRoute() {
    try {
        console.log('Adding enhanced debugging to video routes...');
        
        const routesPath = path.join(__dirname, 'src/routes/videos.js');
        let content = await fs.readFile(routesPath, 'utf8');
        
        // Add better error handling to the getWithStats method
        if (content.includes('try {')) {
            content = content.replace(
                `router.get('/:id', async (req, res) => {
    try {
        const video = await Video.getWithStats(req.params.id);
        res.json(video);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});`,
                `router.get('/:id', async (req, res) => {
    try {
        console.log('Fetching video with ID:', req.params.id);
        const video = await Video.getWithStats(req.params.id);
        console.log('Video found:', video.title);
        res.json(video);
    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(404).json({ 
            error: error.message,
            detail: 'Failed to retrieve video. Please check if the video ID exists.'
        });
    }
});`
            );
            
            await fs.writeFile(routesPath, content);
            console.log('Enhanced video routes with better error handling');
        }
    } catch (error) {
        console.error('Error patching videos route:', error);
    }
}

// Main function
async function main() {
    try {
        // Connect to MongoDB
        mongoConnection.once('open', async () => {
            console.log('MongoDB connection established');
            
            try {
                // Add debugging to routes
                await patchVideosRoute();
                
                // Debug and fix videos
                await debugVideos();
                
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