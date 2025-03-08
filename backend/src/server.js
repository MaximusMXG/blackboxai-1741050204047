const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const { mongoConnection, sqliteDb } = require('./db/database'); // Database connections
const seedDatabase = require('./db/seed'); // Database seeding

const userRoutes = require('./routes/users');
const videoRoutes = require('./routes/videos');
const subscriptionRoutes = require('./routes/subscriptions');

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

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
        sqlite: !!sqliteDb ? 'available' : 'unavailable'
    });
});

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
    });
});

// Handle database connection errors
mongoConnection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

module.exports = app;
