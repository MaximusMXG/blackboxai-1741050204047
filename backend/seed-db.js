#!/usr/bin/env node
const mongoose = require('mongoose');
const { mongoConnection } = require('./src/db/database');
const seedDatabase = require('./src/db/seed');

console.log('Starting database seeding process...');

// Wait for MongoDB connection to be established
mongoConnection.once('open', async () => {
    console.log('MongoDB connection established');
    
    try {
        console.log('Beginning database seed...');
        await seedDatabase();
        console.log('Database seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error during database seeding:', error);
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