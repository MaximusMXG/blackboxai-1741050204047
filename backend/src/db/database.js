const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { db: sqliteDb, initializeSchema } = require('./schema');
require('dotenv').config();

// Ensure the .env file is properly loaded
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/slice';

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Created data directory');
}

// Create MongoDB connection with retry logic
const connectWithRetry = () => {
    console.log('MongoDB connection attempt...');
    mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    })
    .then(() => {
        console.log('Connected to MongoDB successfully');
        // Initialize indexes
        mongoose.connection.on('open', () => {
            console.log('Setting up database indexes');
            // The models will handle their own indexes
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
    });
};

// Connect with retry
connectWithRetry();

// Handle connection events
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected, attempting to reconnect...');
    setTimeout(connectWithRetry, 5000);
});

// Export both MongoDB and SQLite connections
module.exports = {
    mongoConnection: mongoose.connection,
    sqliteDb: sqliteDb
};
