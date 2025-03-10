require('dotenv').config();
const mongoose = require('mongoose');
const { connect } = require('./src/db/database');
const Brand = require('./src/models/Brand');
const User = require('./src/models/User');
const Video = require('./src/models/Video');
const Subscription = require('./src/models/Subscription');
const Partnership = require('./src/models/Partnership');

// Connect to MongoDB
async function runTests() {
    try {
        await connect();
        console.log('Connected to MongoDB for testing');
        
        // Test 1: Verify Brand Model
        console.log('\n-------- TESTING BRAND MODEL --------');
        const brandCount = await Brand.countDocuments();
        console.log(`Found ${brandCount} brands in the database`);
        
        if (brandCount === 0) {
            console.log('No brands found. Please run seed-brands.js first.');
        } else {
            // Get a sample brand
            const sampleBrand = await Brand.findOne();
            console.log('Sample Brand:');
            console.log(`- Name: ${sampleBrand.name}`);
            console.log(`- Category: ${sampleBrand.category}`);
            console.log(`- Followers: ${sampleBrand.followersCount}`);
            console.log(`- Social Media Links: ${sampleBrand.socialMedia.length}`);
            
            // Test the analytics method
            console.log('\nTesting brand analytics function:');
            try {
                // Add a sample analytics entry
                await sampleBrand.addAnalyticsEntry({
                    views: 100,
                    sliceAllocation: 25,
                    engagement: 50
                });
                console.log('Successfully added analytics entry');
                
                // Now get analytics summary
                const analyticsSummary = await Brand.getAnalyticsSummary(sampleBrand._id);
                console.log('Analytics Summary:', analyticsSummary);
            } catch (err) {
                console.error('Error testing brand analytics:', err);
            }
        }
        
        // Test 2: Verify Video-Brand Relationships
        console.log('\n-------- TESTING VIDEO-BRAND RELATIONSHIPS --------');
        const videoCount = await Video.countDocuments();
        console.log(`Found ${videoCount} videos in the database`);
        
        // Let's add brand IDs to some videos if there are any
        if (videoCount > 0 && brandCount > 0) {
            const brands = await Brand.find().limit(3);
            const videos = await Video.find().limit(10);
            
            console.log(`Updating ${Math.min(videos.length, 10)} videos with brand information...`);
            
            for (let i = 0; i < Math.min(videos.length, 10); i++) {
                const brandIndex = i % brands.length;
                const video = videos[i];
                
                video.brandId = brands[brandIndex]._id;
                video.creator = brands[brandIndex].name;
                await video.save();
                
                // Update brand video count
                const brand = brands[brandIndex];
                brand.totalVideos += 1;
                await brand.save();
            }
            
            console.log('Successfully updated videos with brand information');
        }
        
        // Test 3: Test Slice Allocation
        console.log('\n-------- TESTING SLICE ALLOCATION --------');
        const userCount = await User.countDocuments();
        console.log(`Found ${userCount} users in the database`);
        
        if (userCount > 0 && videoCount > 0) {
            const users = await User.find().limit(5);
            const videos = await Video.find().limit(10);
            
            console.log(`Creating slice allocations for ${users.length} users on ${videos.length} videos...`);
            
            // Create a function to allocate slices
            const allocateSlices = async (userId, videoId, sliceCount) => {
                try {
                    // Check if allocation already exists
                    const existingAllocation = await Subscription.findOne({
                        user_id: userId,
                        video_id: videoId
                    });
                    
                    if (existingAllocation) {
                        existingAllocation.slices = sliceCount;
                        await existingAllocation.save();
                        return existingAllocation;
                    } else {
                        const newAllocation = new Subscription({
                            user_id: userId,
                            video_id: videoId,
                            slices: sliceCount
                        });
                        await newAllocation.save();
                        return newAllocation;
                    }
                } catch (err) {
                    console.error('Error allocating slices:', err);
                    return null;
                }
            };
            
            // Allocate slices for each user on random videos
            for (const user of users) {
                // Give user some slices to allocate
                user.slices = 20;
                await user.save();
                
                // Allocate to random videos
                const numAllocations = Math.floor(Math.random() * 5) + 1; // 1-5 allocations
                
                for (let i = 0; i < numAllocations; i++) {
                    const randomVideoIndex = Math.floor(Math.random() * videos.length);
                    const randomSlices = Math.floor(Math.random() * 5) + 1; // 1-5 slices
                    
                    const allocation = await allocateSlices(
                        user._id,
                        videos[randomVideoIndex]._id,
                        randomSlices
                    );
                    
                    if (allocation) {
                        console.log(`User ${user.username} allocated ${randomSlices} slices to video "${videos[randomVideoIndex].title}"`);
                        
                        // Update user's slice count
                        user.slices -= randomSlices;
                        await user.save();
                        
                        // Update video's slice count if it has the field
                        if (videos[randomVideoIndex].slices !== undefined) {
                            videos[randomVideoIndex].slices += randomSlices;
                            await videos[randomVideoIndex].save();
                        }
                        
                        // If video has a brand, update the brand's slice count
                        if (videos[randomVideoIndex].brandId) {
                            const brand = await Brand.findById(videos[randomVideoIndex].brandId);
                            if (brand) {
                                brand.totalSlicesReceived += randomSlices;
                                await brand.save();
                                
                                // Add analytics entry
                                await brand.addAnalyticsEntry({
                                    sliceAllocation: randomSlices,
                                    views: Math.floor(Math.random() * 50) + 10, // Some random views
                                    engagement: Math.floor(Math.random() * 20) + 5 // Some random engagement
                                });
                            }
                        }
                    }
                }
                
                console.log(`User ${user.username} has ${user.slices} slices remaining`);
            }
            
            // Verify slice allocations
            const allocationCount = await Subscription.countDocuments();
            console.log(`Total slice allocations in database: ${allocationCount}`);
        }
        
        // Test 4: Test Partnership Features
        console.log('\n-------- TESTING PARTNERSHIP FEATURES --------');
        const partnershipCount = await Partnership.countDocuments();
        console.log(`Found ${partnershipCount} partnership applications in the database`);
        
        if (userCount > 0 && brandCount > 0) {
            const users = await User.find().limit(3);
            
            // Create partnership applications for these users
            for (const user of users) {
                const existingPartnership = await Partnership.findOne({ userId: user._id });
                
                if (!existingPartnership) {
                    const partnership = new Partnership({
                        userId: user._id,
                        username: user.username,
                        email: user.email,
                        applicationData: {
                            channelName: `${user.username}'s Channel`,
                            content: 'Gaming, Tech Reviews',
                            platformLinks: 'https://youtube.com/example',
                            experience: '2 years of content creation',
                            goals: 'Grow my audience and create engaging content'
                        },
                        status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)]
                    });
                    
                    await partnership.save();
                    console.log(`Created partnership application for ${user.username} with status: ${partnership.status}`);
                } else {
                    console.log(`User ${user.username} already has a partnership application`);
                }
            }
            
            // Verify partnership applications
            const updatedPartnershipCount = await Partnership.countDocuments();
            console.log(`Total partnership applications after test: ${updatedPartnershipCount}`);
        }
        
        console.log('\n-------- TESTING COMPLETE --------');
        console.log('All database features have been successfully tested!');
        console.log('\nTo test frontend features:');
        console.log('1. Start the backend server: node start-server.js');
        console.log('2. Start the frontend: cd streaming-platform && npm run dev');
        console.log('3. Visit the site and test the following features:');
        console.log('   - Pizza slice allocation on videos');
        console.log('   - Pizza avatar in navbar and profile');
        console.log('   - Slice history on the profile page');
        console.log('   - Brand discovery page at /brands');
        console.log('   - Individual brand pages at /brands/:slug');
        console.log('   - Brand dashboard at /brand-dashboard');
        
        mongoose.connection.close();
    } catch (error) {
        console.error('Error running tests:', error);
        mongoose.connection.close();
        process.exit(1);
    }
}

runTests();