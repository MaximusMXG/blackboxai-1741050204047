const mongoose = require('mongoose');
require('dotenv').config();

// Import database connection
const { mongoConnection } = require('./src/db/database');

// Wait for database connection
mongoConnection.once('open', async () => {
    console.log('Connected to MongoDB');
    
    try {
        // Use the User model
        const User = mongoose.model('User');
        
        // Find admin user
        const adminUser = await User.findOne({ email: 'admin@slice.com' });
        
        if (adminUser) {
            console.log('Admin user found in database!');
            console.log({
                id: adminUser._id,
                username: adminUser.username,
                email: adminUser.email,
                isAdmin: adminUser.isAdmin,
                role: adminUser.role,
                passwordLength: adminUser.password.length,
                // Don't print the actual password for security reasons
                passwordType: typeof adminUser.password,
                createdAt: adminUser.createdAt
            });
        } else {
            console.log('Admin user NOT found in database!');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error checking admin user:', error);
        process.exit(1);
    }
});

// Handle database connection errors
mongoConnection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});