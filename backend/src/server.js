const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const usersRouter = require('./routes/users');
const videosRouter = require('./routes/videos');
const subscriptionsRouter = require('./routes/subscriptions');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', usersRouter);
app.use('/api/videos', videosRouter);
app.use('/api/subscriptions', subscriptionsRouter);

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ 
        message: 'Welcome to the Slice API',
        endpoints: {
            users: '/api/users',
            videos: '/api/videos',
            subscriptions: '/api/subscriptions'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: err.message 
    });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}`);
});
