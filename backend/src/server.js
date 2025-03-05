const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./db/database'); // MongoDB connection

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
    res.json({ status: 'OK' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;
