#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

console.log('Starting Slice backend server...');

// Ensure we're in development mode
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
    console.log('Setting NODE_ENV to development mode');
}

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'src', 'db', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Created data directory at', dataDir);
}

// Function to check if MongoDB is empty
const checkIfDatabaseIsEmpty = async () => {
    try {
        console.log('Checking if database needs to be seeded...');
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/slice';
        
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        
        // Get counts from collections
        const Video = mongoose.model('Video', new mongoose.Schema({}), 'videos');
        const User = mongoose.model('User', new mongoose.Schema({}), 'users');
        
        const videoCount = await Video.countDocuments();
        const userCount = await User.countDocuments();
        
        // Disconnect from MongoDB
        await mongoose.disconnect();
        
        return videoCount === 0 && userCount === 0;
    } catch (error) {
        console.error('Error checking database:', error);
        // If there's an error (like the database not being connected yet),
        // we'll assume we need to seed the database
        return true;
    }
};

// Function to seed the database
const seedDatabase = async () => {
    console.log('Seeding database...');
    return new Promise((resolve, reject) => {
        const seedProcess = spawn('node', ['seed-db.js'], {
            cwd: __dirname,
            stdio: 'inherit'
        });
        
        seedProcess.on('close', (code) => {
            if (code === 0) {
                console.log('Database seeded successfully.');
                resolve();
            } else {
                console.error(`Database seeding process exited with code ${code}`);
                reject();
            }
        });
    });
};

// Function to start the server
const startServer = () => {
    console.log('Starting server...');
    const serverProcess = spawn('node', ['src/server.js'], {
        cwd: __dirname,
        stdio: 'inherit',
        env: { 
            ...process.env, 
            NODE_ENV: process.env.NODE_ENV || 'development' 
        }
    });
    
    serverProcess.on('close', (code) => {
        console.error(`Server process exited with code ${code}`);
        process.exit(code);
    });
};

// Main function to orchestrate startup
const main = async () => {
    try {
        // Check if database is empty
        const isEmpty = await checkIfDatabaseIsEmpty();
        
        // If empty, seed the database
        if (isEmpty) {
            await seedDatabase();
        } else {
            console.log('Database already contains data, skipping seed.');
        }
        
        // Start the server
        startServer();
    } catch (error) {
        console.error('Error during startup:', error);
        process.exit(1);
    }
};

// Run the main function
main();