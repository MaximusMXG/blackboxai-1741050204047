require('dotenv').config();
const mongoose = require('mongoose');
const { connect } = require('./src/db/database');
const Brand = require('./src/models/Brand');

// Sample Brand Data
const brandData = [
    {
        name: "Pixel Studios",
        slug: "pixel-studios",
        email: "contact@pixelstudios.com",
        password: "pixelstudios123",
        description: "Independent game development studio focused on creating innovative and engaging pixel art games. Known for our retro-inspired visuals with modern gameplay mechanics.",
        shortDescription: "Indie pixel art game developers",
        logo: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        coverImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        category: "gaming",
        tags: ["indie games", "pixel art", "retro", "game development"],
        isVerified: true,
        followersCount: 1280,
        totalVideos: 42,
        totalViews: 784500,
        totalSlicesReceived: 12300,
        socialMedia: [
            {
                platform: "twitter",
                url: "https://twitter.com/pixelstudios",
                followers: 5200
            },
            {
                platform: "instagram",
                url: "https://instagram.com/pixelstudios",
                followers: 7800
            },
            {
                platform: "youtube",
                url: "https://youtube.com/pixelstudios",
                followers: 12000
            }
        ]
    },
    {
        name: "Melody Makers",
        slug: "melody-makers",
        email: "info@melodymakers.com",
        password: "melodymakers123",
        description: "Music production collective creating original compositions and collaborating with emerging artists. Our channel features tutorials, beat breakdowns, and behind-the-scenes looks at the music production process.",
        shortDescription: "Music production collective & tutorials",
        logo: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        coverImage: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        category: "music",
        tags: ["music production", "tutorials", "beats", "composition"],
        isVerified: true,
        followersCount: 3450,
        totalVideos: 87,
        totalViews: 1250000,
        totalSlicesReceived: 25600,
        socialMedia: [
            {
                platform: "instagram",
                url: "https://instagram.com/melodymakers",
                followers: 15000
            },
            {
                platform: "tiktok",
                url: "https://tiktok.com/@melodymakers",
                followers: 22000
            },
            {
                platform: "website",
                url: "https://melodymakers.com",
                followers: 0
            }
        ]
    },
    {
        name: "Tech Insights",
        slug: "tech-insights",
        email: "contact@techinsights.com",
        password: "techinsights123",
        description: "Deep dives into the latest technology trends, product reviews, and analysis of tech industry developments. Our team of tech enthusiasts brings you well-researched content about everything from consumer gadgets to enterprise software.",
        shortDescription: "In-depth tech analysis & reviews",
        logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        category: "technology",
        tags: ["tech reviews", "industry analysis", "gadgets", "software"],
        isVerified: true,
        followersCount: 5670,
        totalVideos: 124,
        totalViews: 1870000,
        totalSlicesReceived: 31200,
        socialMedia: [
            {
                platform: "twitter",
                url: "https://twitter.com/techinsights",
                followers: 18500
            },
            {
                platform: "linkedin",
                url: "https://linkedin.com/company/techinsights",
                followers: 7200
            },
            {
                platform: "website",
                url: "https://techinsightsreview.com",
                followers: 0
            }
        ]
    },
    {
        name: "Adventure Seekers",
        slug: "adventure-seekers",
        email: "hello@adventureseekers.com",
        password: "adventure123",
        description: "Travel vloggers documenting adventures from around the world. From exploring remote wilderness to urban expeditions, we share travel tips, destination guides, and our experiences with different cultures and landscapes.",
        shortDescription: "World travel vloggers & guides",
        logo: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        coverImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        category: "travel",
        tags: ["travel", "adventure", "vlog", "destinations"],
        isVerified: true,
        followersCount: 4230,
        totalVideos: 98,
        totalViews: 2150000,
        totalSlicesReceived: 28900,
        socialMedia: [
            {
                platform: "instagram",
                url: "https://instagram.com/adventureseekers",
                followers: 32000
            },
            {
                platform: "youtube",
                url: "https://youtube.com/adventureseekers",
                followers: 185000
            },
            {
                platform: "facebook",
                url: "https://facebook.com/adventureseekers",
                followers: 27000
            }
        ]
    },
    {
        name: "Culinary Canvas",
        slug: "culinary-canvas",
        email: "chef@culinarycanvas.com",
        password: "culinary123",
        description: "Food content creators showcasing gourmet recipes, cooking techniques, and culinary experiences. Our channel blends the art and science of cooking, with a focus on presentation and innovative flavor combinations.",
        shortDescription: "Gourmet cooking & food artistry",
        logo: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        coverImage: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        category: "food",
        tags: ["cooking", "recipes", "food art", "culinary"],
        isVerified: true,
        followersCount: 3890,
        totalVideos: 72,
        totalViews: 1680000,
        totalSlicesReceived: 22500,
        socialMedia: [
            {
                platform: "instagram",
                url: "https://instagram.com/culinarycanvas",
                followers: 45000
            },
            {
                platform: "tiktok",
                url: "https://tiktok.com/@culinarycanvas",
                followers: 67000
            },
            {
                platform: "website",
                url: "https://culinarycanvas.com",
                followers: 0
            }
        ]
    },
    {
        name: "Fitness Revolution",
        slug: "fitness-revolution",
        email: "train@fitnessrevolution.com",
        password: "fitness123",
        description: "Fitness trainers providing workout routines, nutrition advice, and wellness tips. Our brand focuses on accessible fitness for all levels, with programs designed to fit into busy lifestyles and achieve sustainable results.",
        shortDescription: "Accessible workouts & wellness",
        logo: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        coverImage: "https://images.unsplash.com/photo-1518310383802-640c2de311b6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        category: "fitness",
        tags: ["workouts", "nutrition", "wellness", "fitness"],
        isVerified: true,
        followersCount: 6780,
        totalVideos: 145,
        totalViews: 3250000,
        totalSlicesReceived: 41800,
        socialMedia: [
            {
                platform: "instagram",
                url: "https://instagram.com/fitnessrevolution",
                followers: 98000
            },
            {
                platform: "youtube",
                url: "https://youtube.com/fitnessrevolution",
                followers: 210000
            },
            {
                platform: "website",
                url: "https://fitnessrevolution.fit",
                followers: 0
            }
        ]
    },
    {
        name: "Brainwave Academy",
        slug: "brainwave-academy",
        email: "learn@brainwaveacademy.com",
        password: "brainwave123",
        description: "Educational content creators specializing in accessible explanations of complex topics in science, math, and technology. Our mission is to make learning engaging and understandable for students of all ages.",
        shortDescription: "Making complex subjects simple",
        logo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        category: "education",
        tags: ["learning", "science", "math", "education"],
        isVerified: true,
        followersCount: 7890,
        totalVideos: 212,
        totalViews: 4350000,
        totalSlicesReceived: 52300,
        socialMedia: [
            {
                platform: "youtube",
                url: "https://youtube.com/brainwaveacademy",
                followers: 380000
            },
            {
                platform: "twitter",
                url: "https://twitter.com/brainwaveacad",
                followers: 45000
            },
            {
                platform: "website",
                url: "https://brainwaveacademy.edu",
                followers: 0
            }
        ]
    },
    {
        name: "Digital Nomad Life",
        slug: "digital-nomad-life",
        email: "info@digitalnomadlife.com",
        password: "nomad123",
        description: "Remote work advocates sharing tips on digital nomad lifestyle, productivity hacks, and global co-working spaces. We document our experiences working from different countries while balancing travel and career.",
        shortDescription: "Remote work & location independence",
        logo: "https://images.unsplash.com/photo-1502945015378-0e284ca1a5be?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        coverImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        category: "lifestyle",
        tags: ["remote work", "travel", "productivity", "digital nomad"],
        isVerified: true,
        followersCount: 3120,
        totalVideos: 67,
        totalViews: 980000,
        totalSlicesReceived: 18500,
        socialMedia: [
            {
                platform: "instagram",
                url: "https://instagram.com/digitalnomadlife",
                followers: 58000
            },
            {
                platform: "twitter",
                url: "https://twitter.com/digitalnomadlf",
                followers: 22000
            },
            {
                platform: "website",
                url: "https://digitalnomadlife.co",
                followers: 0
            }
        ]
    }
];

// Connect to MongoDB
async function seedBrands() {
    try {
        await connect();
        console.log('Connected to MongoDB');
        
        // Clear existing brands
        await Brand.deleteMany({});
        console.log('Cleared existing brands');
        
        // Insert new brand data
        const insertedBrands = await Brand.insertMany(brandData);
        console.log(`Inserted ${insertedBrands.length} brands`);
        
        console.log('Brands seeding completed!');
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding brands:', error);
        mongoose.connection.close();
        process.exit(1);
    }
}

seedBrands();