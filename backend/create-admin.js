const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import database connection
const { mongoConnection } = require('./src/db/database');

// Wait for database connection
mongoConnection.once('open', async () => {
    console.log('Connected to MongoDB');
    
    try {
        // Use the User model
        const User = mongoose.model('User');
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@slice.com' });
        
        if (existingAdmin) {
            console.log('Admin user already exists!');
        } else {
            // Create hashed password
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            // Create admin user
            const adminUser = new User({
                username: 'admin',
                email: 'admin@slice.com',
                password: hashedPassword,
                isAdmin: true,
                isPremium: true,
                slices: 1000,
                role: 'admin',
                bio: 'System administrator'
            });
            
            await adminUser.save();
            console.log('Admin user created successfully!');
        }
        
        // Create a partner user for testing
        const existingPartner = await User.findOne({ email: 'partner@slice.com' });
        
        if (existingPartner) {
            console.log('Partner user already exists!');
        } else {
            // Create hashed password
            const hashedPassword = await bcrypt.hash('partner123', 10);
            
            // Create partner user
            const partnerUser = new User({
                username: 'partnerTest',
                email: 'partner@slice.com',
                password: hashedPassword,
                isAdmin: false,
                isPartner: true,
                isPremium: true,
                slices: 500,
                role: 'creator',
                bio: 'Content creator for testing'
            });
            
            await partnerUser.save();
            console.log('Partner user created successfully!');
        }
        
        console.log('Test users setup complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating test users:', error);
        process.exit(1);
    }
});

// Handle database connection errors
mongoConnection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});