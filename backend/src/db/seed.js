const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Video = require('../models/Video');
require('./database');

const seedDatabase = async () => {
    try {
        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Video.deleteMany({})
        ]);

        // Create test user
        const hashedPassword = await bcrypt.hash('testpassword', 10);
        await User.create({
            username: 'testuser',
            email: 'test@example.com',
            password: hashedPassword,
            slices: 100
        });

        // Create sample videos
        const videos = [
            // Indie Games
            {
                title: "Pixel Adventure",
                creator: "Indie Studio A",
                genre: "indie",
                thumbnail_url: "https://placeholder.com/300x200"
            },
            {
                title: "Space Explorer",
                creator: "Solo Dev B",
                genre: "indie",
                thumbnail_url: "https://placeholder.com/300x200"
            },
            {
                title: "Puzzle Master",
                creator: "Indie Team C",
                genre: "indie",
                thumbnail_url: "https://placeholder.com/300x200"
            },
            // Mainstream
            {
                title: "Urban Stories",
                creator: "Director X",
                genre: "mainstream",
                thumbnail_url: "https://placeholder.com/300x200"
            },
            {
                title: "Nature's Call",
                creator: "Studio Y",
                genre: "mainstream",
                thumbnail_url: "https://placeholder.com/300x200"
            },
            {
                title: "Digital Dreams",
                creator: "Creator Z",
                genre: "mainstream",
                thumbnail_url: "https://placeholder.com/300x200"
            },
            // Crowdfunding
            {
                title: "New Project 1",
                creator: "New Studio A",
                genre: "crowdfunding",
                thumbnail_url: "https://placeholder.com/300x200"
            },
            {
                title: "New Project 2",
                creator: "Artist B",
                genre: "crowdfunding",
                thumbnail_url: "https://placeholder.com/300x200"
            }
        ];

        // Insert videos
        await Video.insertMany(videos);

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
