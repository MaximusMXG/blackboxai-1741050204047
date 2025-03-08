const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Video = require('../models/Video');
const Subscription = require('../models/Subscription');
const SubscriptionSlice = require('../models/SubscriptionSlice');
const { mongoConnection, sqliteDb } = require('./database');

const seedDatabase = async () => {
    try {
        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Video.deleteMany({}),
            Subscription.deleteMany({})
        ]);
        
        // Clear SQLite-based subscription slices
        try {
            await SubscriptionSlice.clearAll();
            console.log('Cleared existing subscription slices');
        } catch (err) {
            console.error('Error clearing subscription_slices:', err);
        }

        console.log('Creating users...');
        
        // Create test users with hashed passwords
        const password = await bcrypt.hash('testpassword', 10);
        
        const users = await User.insertMany([
            {
                username: 'testuser',
                email: 'test@example.com',
                password,
                slices: 100,
                bio: 'A regular user who enjoys all kinds of content',
                profilePicture: 'https://picsum.photos/200?random=1',
                watchHistory: [],
                notifications: [
                    {
                        message: 'Welcome to Slice! Allocate your slices to support creators.',
                        type: 'system'
                    }
                ],
                preferences: {
                    preferredGenres: ['indie', 'mainstream']
                }
            },
            {
                username: 'premiumuser',
                email: 'premium@example.com',
                password,
                slices: 500,
                isPremium: true,
                bio: 'Premium subscriber who loves indie content',
                profilePicture: 'https://picsum.photos/200?random=2',
                watchHistory: [],
                notifications: [
                    {
                        message: 'Thanks for becoming a premium member!',
                        type: 'system'
                    },
                    {
                        message: 'You received 300 bonus slices for upgrading!',
                        type: 'slice'
                    }
                ],
                preferences: {
                    theme: 'dark',
                    preferredGenres: ['indie', 'crowdfunding']
                }
            },
            {
                username: 'creator',
                email: 'creator@example.com',
                password,
                slices: 150,
                bio: 'Content creator specializing in indie games',
                profilePicture: 'https://picsum.photos/200?random=3',
                watchHistory: [],
                notifications: [
                    {
                        message: 'Your latest video is trending!',
                        type: 'video'
                    }
                ]
            },
            {
                username: 'newuser',
                email: 'new@example.com',
                password,
                slices: 50,
                bio: 'Just joined Slice',
                profilePicture: 'https://picsum.photos/200?random=4'
            },
            {
                username: 'filmmaker',
                email: 'film@example.com',
                password,
                slices: 200,
                isPremium: true,
                bio: 'Independent filmmaker focused on documentaries',
                profilePicture: 'https://picsum.photos/200?random=5',
                notifications: [
                    {
                        message: 'Your documentary has been featured!',
                        type: 'video'
                    }
                ],
                preferences: {
                    theme: 'dark',
                    preferredGenres: ['mainstream', 'indie']
                }
            },
            {
                username: 'slicefan',
                email: 'fan@example.com',
                password,
                slices: 300,
                bio: 'Passionate about supporting creators through Slice',
                profilePicture: 'https://picsum.photos/200?random=6',
                preferences: {
                    preferredGenres: ['crowdfunding', 'indie', 'mainstream']
                }
            }
        ]);
        
        console.log(`Created ${users.length} users`);

        // Create sample videos
        const videos = [
            // Indie Games & Films
            {
                title: "Pixel Adventure",
                creator: "Indie Studio A",
                genre: "indie",
                thumbnail_url: "https://picsum.photos/300/200?random=1",
                description: "A captivating pixel art adventure game with unique puzzles and charming characters.",
                views: Math.floor(Math.random() * 50000) + 10000,
                duration: "18:45",
                tags: ["indie", "pixel art", "adventure"],
                featured: true
            },
            {
                title: "Space Explorer",
                creator: "Solo Dev B",
                genre: "indie",
                thumbnail_url: "https://picsum.photos/300/200?random=2",
                description: "Explore the vastness of space in this procedurally generated universe simulator.",
                views: Math.floor(Math.random() * 30000) + 5000,
                duration: "15:20",
                tags: ["indie", "space", "exploration", "simulation"]
            },
            {
                title: "Puzzle Master",
                creator: "Indie Team C",
                genre: "indie",
                thumbnail_url: "https://picsum.photos/300/200?random=3",
                description: "Test your intellect with increasingly challenging puzzles and mind-bending mechanics.",
                views: Math.floor(Math.random() * 20000) + 5000,
                duration: "12:30",
                tags: ["indie", "puzzle", "brain teaser"]
            },
            {
                title: "Roguelike Revolution",
                creator: "Indie Collective",
                genre: "indie",
                thumbnail_url: "https://picsum.photos/300/200?random=9",
                description: "A procedurally generated dungeon crawler with permadeath and unique character builds.",
                views: Math.floor(Math.random() * 45000) + 8000,
                duration: "22:15",
                tags: ["indie", "roguelike", "rpg", "permadeath"]
            },
            {
                title: "Cyberpunk Noir",
                creator: "Neon Studios",
                genre: "indie",
                thumbnail_url: "https://picsum.photos/300/200?random=10",
                description: "A narrative-driven detective story set in a dystopian cyberpunk future.",
                views: Math.floor(Math.random() * 55000) + 15000,
                duration: "26:40",
                tags: ["indie", "cyberpunk", "narrative", "detective"]
            },
            {
                title: "Handcrafted Heroes",
                creator: "Artisan Games",
                genre: "indie",
                thumbnail_url: "https://picsum.photos/300/200?random=11",
                description: "A beautiful hand-drawn platformer with unique painterly visuals and tight controls.",
                views: Math.floor(Math.random() * 38000) + 12000,
                duration: "19:35",
                tags: ["indie", "platformer", "hand-drawn", "artistic"]
            },
            {
                title: "Folk Tales Reimagined",
                creator: "Storysmith Studio",
                genre: "indie",
                thumbnail_url: "https://picsum.photos/300/200?random=18",
                description: "A collection of reimagined folk tales from around the world, presented with stunning animation.",
                views: Math.floor(Math.random() * 42000) + 11000,
                duration: "24:18",
                tags: ["indie", "animation", "folklore", "international"]
            },
            {
                title: "Mindful Gaming",
                creator: "Zen Interactive",
                genre: "indie",
                thumbnail_url: "https://picsum.photos/300/200?random=19",
                description: "Explore games designed to promote mindfulness, focus, and mental wellbeing.",
                views: Math.floor(Math.random() * 35000) + 8000,
                duration: "17:42",
                tags: ["indie", "mindfulness", "wellness", "relaxation"]
            },
            // Mainstream
            {
                title: "Urban Stories",
                creator: "Director X",
                genre: "mainstream",
                thumbnail_url: "https://picsum.photos/300/200?random=4",
                description: "A gritty documentary exploring the diverse lives in metropolitan cities around the world.",
                views: Math.floor(Math.random() * 500000) + 100000,
                duration: "42:15",
                tags: ["documentary", "urban", "society"],
                featured: true
            },
            {
                title: "Nature's Call",
                creator: "Studio Y",
                genre: "mainstream",
                thumbnail_url: "https://picsum.photos/300/200?random=5",
                description: "Breathtaking footage of natural wonders and wildlife from across the globe.",
                views: Math.floor(Math.random() * 400000) + 150000,
                duration: "38:50",
                tags: ["nature", "wildlife", "documentary"]
            },
            {
                title: "Digital Dreams",
                creator: "Creator Z",
                genre: "mainstream",
                thumbnail_url: "https://picsum.photos/300/200?random=6",
                description: "An exploration of how technology is shaping our dreams and aspirations.",
                views: Math.floor(Math.random() * 350000) + 100000,
                duration: "28:15",
                tags: ["technology", "society", "documentary"]
            },
            {
                title: "The Last Frontier",
                creator: "Exploration Films",
                genre: "mainstream",
                thumbnail_url: "https://picsum.photos/300/200?random=12",
                description: "Journey to the most remote and untouched places on Earth in this stunning documentary.",
                views: Math.floor(Math.random() * 480000) + 120000,
                duration: "45:10",
                tags: ["travel", "adventure", "documentary", "nature"]
            },
            {
                title: "Global Gastronomy",
                creator: "Culinary Network",
                genre: "mainstream",
                thumbnail_url: "https://picsum.photos/300/200?random=13",
                description: "Explore the world's most fascinating cuisines and the cultures behind them.",
                views: Math.floor(Math.random() * 420000) + 110000,
                duration: "36:25",
                tags: ["food", "culture", "travel", "cooking"]
            },
            {
                title: "Artificial Revolution",
                creator: "Future Tech Media",
                genre: "mainstream",
                thumbnail_url: "https://picsum.photos/300/200?random=14",
                description: "An in-depth look at how artificial intelligence is transforming every aspect of our lives.",
                views: Math.floor(Math.random() * 390000) + 130000,
                duration: "52:38",
                tags: ["technology", "AI", "future", "documentary"]
            },
            {
                title: "Ocean Mysteries",
                creator: "Deep Blue Productions",
                genre: "mainstream",
                thumbnail_url: "https://picsum.photos/300/200?random=20",
                description: "Discover the unexplored depths of our oceans and the mysterious creatures that call them home.",
                views: Math.floor(Math.random() * 450000) + 125000,
                duration: "41:22",
                tags: ["ocean", "marine-life", "documentary", "exploration"]
            },
            {
                title: "Modern Architecture",
                creator: "Design Forward",
                genre: "mainstream",
                thumbnail_url: "https://picsum.photos/300/200?random=21",
                description: "Explore the most innovative and stunning architectural achievements of the 21st century.",
                views: Math.floor(Math.random() * 380000) + 115000,
                duration: "35:10",
                tags: ["architecture", "design", "urban", "innovation"]
            },
            {
                title: "Hidden History",
                creator: "Time Capsule Media",
                genre: "mainstream",
                thumbnail_url: "https://picsum.photos/300/200?random=22",
                description: "Uncover forgotten historical events that shaped our world but rarely appear in textbooks.",
                views: Math.floor(Math.random() * 410000) + 140000,
                duration: "48:35",
                tags: ["history", "documentary", "education", "untold-stories"]
            },
            // Crowdfunding
            {
                title: "New Horizons",
                creator: "New Studio A",
                genre: "crowdfunding",
                thumbnail_url: "https://picsum.photos/300/200?random=7",
                description: "A revolutionary open-world experience that needs your support to bring its vision to life.",
                views: Math.floor(Math.random() * 15000) + 5000,
                duration: "5:45",
                tags: ["crowdfunding", "open world", "gaming"],
                featured: true
            },
            {
                title: "Harmony Project",
                creator: "Artist B",
                genre: "crowdfunding",
                thumbnail_url: "https://picsum.photos/300/200?random=8",
                description: "An innovative musical experience that combines traditional instruments with cutting-edge technology.",
                views: Math.floor(Math.random() * 12000) + 3000,
                duration: "6:20",
                tags: ["crowdfunding", "music", "technology"]
            },
            {
                title: "Green Revolution",
                creator: "Eco Innovations",
                genre: "crowdfunding",
                thumbnail_url: "https://picsum.photos/300/200?random=15",
                description: "Help fund sustainable technology solutions that could revolutionize how we live and reduce our environmental impact.",
                views: Math.floor(Math.random() * 18000) + 4000,
                duration: "7:55",
                tags: ["crowdfunding", "sustainability", "environment", "technology"]
            },
            {
                title: "Virtual Storyteller",
                creator: "NextGen Narratives",
                genre: "crowdfunding",
                thumbnail_url: "https://picsum.photos/300/200?random=16",
                description: "A groundbreaking VR storytelling platform that lets you become part of the narrative.",
                views: Math.floor(Math.random() * 14000) + 6000,
                duration: "8:30",
                tags: ["crowdfunding", "VR", "storytelling", "interactive"]
            },
            {
                title: "Community Builders",
                creator: "Social Solutions",
                genre: "crowdfunding",
                thumbnail_url: "https://picsum.photos/300/200?random=17",
                description: "An initiative to create affordable, sustainable housing solutions for communities in need.",
                views: Math.floor(Math.random() * 16000) + 7000,
                duration: "9:15",
                tags: ["crowdfunding", "social impact", "housing", "community"]
            }
        ];

        // Enhance videos with creator ID and additional fields
        const creator = users.find(user => user.username === 'creator');
        
        const enhancedVideos = videos.map(video => ({
            ...video,
            creatorId: creator._id,
            video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            video_qualities: {
                '720p': `https://example.com/videos/${video.title.toLowerCase().replace(/\s+/g, '-')}-720p.mp4`,
                '1080p': `https://example.com/videos/${video.title.toLowerCase().replace(/\s+/g, '-')}-1080p.mp4`
            },
            durationSeconds: parseInt(video.duration.split(':')[0]) * 60 + parseInt(video.duration.split(':')[1]),
            releaseDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000), // Random date in the last 30 days
            viewsHistory: Array.from({ length: 7 }, (_, i) => ({
                date: new Date(Date.now() - i * 86400000),
                count: Math.floor(Math.random() * 100) + 1
            })),
            trending: Math.floor(Math.random() * 100)
        }));
        
        // Insert videos
        const insertedVideos = await Video.insertMany(enhancedVideos);
        console.log(`Created ${insertedVideos.length} videos`);
        
        // Create subscriptions
        console.log('Creating subscriptions...');
        
        const subscriptions = [];
        
        // Each user subscribes to 2-3 random videos
        for (const user of users) {
            // Randomly select 2-3 videos
            const numVideos = Math.floor(Math.random() * 2) + 2; // 2-3 videos
            const shuffledVideos = [...insertedVideos].sort(() => 0.5 - Math.random());
            const selectedVideos = shuffledVideos.slice(0, numVideos);
            
            // Allocate slices to selected videos
            let remainingSlices = Math.min(user.slices, 50); // Use up to 50 slices
            
            for (let i = 0; i < selectedVideos.length; i++) {
                const video = selectedVideos[i];
                
                // Last video gets all remaining slices, others get random portion
                let sliceCount;
                if (i === selectedVideos.length - 1) {
                    sliceCount = remainingSlices;
                } else {
                    sliceCount = Math.floor(Math.random() * (remainingSlices / 2)) + 1;
                }
                
                if (sliceCount > 0) {
                    remainingSlices -= sliceCount;
                    
                    // Create subscription
                    subscriptions.push({
                        userId: user._id,
                        videoId: video._id,
                        slices: sliceCount,
                        active: true,
                        lastUpdated: new Date()
                    });
                    
                    // Allocate slices in the SQLite database
                    try {
                        await SubscriptionSlice.allocateSlices(
                            user._id.toString(),
                            video._id.toString(),
                            sliceCount
                        );
                        console.log(`Allocated ${sliceCount} slices from user ${user.username} to video ${video.title}`);
                    } catch (err) {
                        console.error(`Error allocating slices: ${err.message}`);
                    }
                    
                    // Add video to user's watch history with more details
                    const watchedDuration = Math.floor(Math.random() * video.durationSeconds);
                    const progress = (watchedDuration / video.durationSeconds) * 100;
                    const completed = progress >= 90;
                    
                    await User.findByIdAndUpdate(user._id, {
                        $push: {
                            watchHistory: {
                                videoId: video._id,
                                watchedDuration,
                                watchedAt: new Date(Date.now() - Math.floor(Math.random() * 604800000)), // Within the last week
                                progress,
                                completed,
                                title: video.title,
                                thumbnail: video.thumbnail_url,
                                creator: video.creator,
                                duration: video.duration,
                                durationSeconds: video.durationSeconds,
                                genre: video.genre
                            }
                        }
                    });
                }
            }
        }
        
        // Insert subscriptions
        await Subscription.insertMany(subscriptions);
        console.log(`Created ${subscriptions.length} subscriptions`);
        
        // Add ratings and comments to videos
        console.log('Adding ratings and comments to videos...');
        
        for (const video of insertedVideos) {
            // Add 3-10 random ratings
            const ratingCount = Math.floor(Math.random() * 8) + 3;
            const ratings = [];
            
            for (let i = 0; i < ratingCount; i++) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                ratings.push({
                    userId: randomUser._id,
                    value: Math.floor(Math.random() * 5) + 1 // 1-5 rating
                });
            }
            
            // Add 0-5 comments
            const commentCount = Math.floor(Math.random() * 6);
            const comments = [];
            
            for (let i = 0; i < commentCount; i++) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                comments.push({
                    userId: randomUser._id,
                    username: randomUser.username,
                    content: `This is a sample comment ${i+1}. ${randomUser.username} thinks this video is ${['amazing', 'interesting', 'thought-provoking', 'awesome', 'creative'][Math.floor(Math.random() * 5)]}!`,
                    likes: Math.floor(Math.random() * 10)
                });
            }
            
            await Video.findByIdAndUpdate(video._id, {
                $set: { ratings, comments }
            });
        }
        
        console.log('Database seeded successfully');
        
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};

// Run the seed if this file is run directly
if (require.main === module) {
    seedDatabase().then(() => {
        console.log('Seeding complete');
        process.exit(0);
    }).catch(err => {
        console.error('Seeding failed:', err);
        process.exit(1);
    });
}

module.exports = seedDatabase;
