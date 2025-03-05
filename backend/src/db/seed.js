const db = require('./database');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        // Create test user with hashed password
        const hashedPassword = await bcrypt.hash('testpassword', 10);
        db.run(`
            INSERT OR IGNORE INTO users (id, username, email, password, total_slices)
            VALUES (1, 'testuser', 'test@example.com', ?, 8)
        `, [hashedPassword]);

        // Create sample videos
        const videos = [
            // Indie Games
            {
                title: "Pixel Adventure",
                creator: "Indie Studio A",
                genre: "Game",
                thumbnail_url: "https://placeholder.com/300x200"
            },
            {
                title: "Space Explorer",
                creator: "Solo Dev B",
                genre: "Game",
                thumbnail_url: "https://placeholder.com/300x200"
            },
            {
                title: "Puzzle Master",
                creator: "Indie Team C",
                genre: "Game",
                thumbnail_url: "https://placeholder.com/300x200"
            },
            // Indie Films
            {
                title: "Urban Stories",
                creator: "Director X",
                genre: "Film",
                thumbnail_url: "https://placeholder.com/300x200"
            },
            {
                title: "Nature's Call",
                creator: "Studio Y",
                genre: "Film",
                thumbnail_url: "https://placeholder.com/300x200"
            },
            {
                title: "Digital Dreams",
                creator: "Creator Z",
                genre: "Film",
                thumbnail_url: "https://placeholder.com/300x200"
            },
            // Rising Stars
            {
                title: "New Project 1",
                creator: "New Studio A",
                genre: "Experimental",
                thumbnail_url: "https://placeholder.com/300x200"
            },
            {
                title: "New Project 2",
                creator: "Artist B",
                genre: "Mixed Media",
                thumbnail_url: "https://placeholder.com/300x200"
            }
        ];

        // Insert videos
        videos.forEach((video) => {
            db.run(`
                INSERT OR IGNORE INTO videos (title, creator, genre, thumbnail_url)
                VALUES (?, ?, ?, ?)
            `, [video.title, video.creator, video.genre, video.thumbnail_url]);
        });

        console.log('Database seeded successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};

// Run the seed
seedDatabase();

module.exports = seedDatabase;
