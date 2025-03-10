const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const mongoose = require('mongoose');
const { mongoConnection, sqliteDb } = require('./db/database'); // Database connections
const seedDatabase = require('./db/seed'); // Database seeding

// Import all models to ensure they're registered with Mongoose
require('./models/User');
require('./models/Video');
require('./models/Brand');
require('./models/Partnership');
require('./models/Subscription');
require('./models/SubscriptionSlice');
require('./models/Series');
require('./models/ActivityLog'); // Make sure ActivityLog is loaded

const userRoutes = require('./routes/users');
const videoRoutes = require('./routes/videos');
const subscriptionRoutes = require('./routes/subscriptions');
const partnershipRoutes = require('./routes/partnerships');
const brandRoutes = require('./routes/brands');
const adminRoutes = require('./routes/admin');
const seriesRoutes = require('./routes/series');
const schemaRoutes = require('./routes/schema'); // No auth route for schema management

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Static file serving for storage directories
app.use('/storage', express.static(path.join(__dirname, '../storage')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/partnerships', partnershipRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/schema', schemaRoutes); // No auth route for schema management

// Admin panel redirect (no auth in development)
app.get('/admin-panel', (req, res) => {
    res.redirect('/admin');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        sqlite: !!sqliteDb ? 'available' : 'unavailable',
        storageDirectory: path.join(__dirname, '../storage'),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Check and create storage directories if they don't exist
const fs = require('fs');
const storagePath = path.join(__dirname, '../storage');
const brandPath = path.join(storagePath, 'brands');
const videoPath = path.join(storagePath, 'videos');

try {
    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
        console.log('Created storage directory');
    }
    if (!fs.existsSync(brandPath)) {
        fs.mkdirSync(brandPath, { recursive: true });
        console.log('Created brands directory');
    }
    if (!fs.existsSync(videoPath)) {
        fs.mkdirSync(videoPath, { recursive: true });
        console.log('Created videos directory');
    }
} catch (err) {
    console.error('Error creating storage directories:', err);
}

// Auto-seed database on first startup if empty
mongoConnection.once('open', async () => {
    console.log('Connected to MongoDB');
    
    try {
        // Check if database is empty
        const videoCount = await mongoose.model('Video').countDocuments();
        const userCount = await mongoose.model('User').countDocuments();
        
        if (videoCount === 0 && userCount === 0) {
            console.log('Database is empty, running initial seed...');
            await seedDatabase();
        }
    } catch (error) {
        console.error('Error checking/seeding database:', error);
    }
    
    // Start server after database connection and optional seeding
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`Storage path: ${storagePath}`);
        console.log(`Access storage at: http://localhost:${port}/storage`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
});

// Handle database connection errors
mongoConnection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

module.exports = app;
