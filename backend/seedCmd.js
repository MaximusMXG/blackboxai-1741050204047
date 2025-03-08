#!/usr/bin/env node

/**
 * Database seeding script for Slice platform
 * 
 * This script populates the database with sample data for:
 * - Users (regular, premium, creators)
 * - Videos (indie, mainstream, crowdfunding)
 * - Subscriptions and Slice allocations
 * - Watch history, ratings, and comments
 * 
 * Usage: node seedCmd.js [--clear] [--env <environment>]
 * Options:
 *   --clear: Clear the database before seeding
 *   --env: Specify environment (development, production, test)
 */

const seedDatabase = require('./src/db/seed');
const readline = require('readline');

// Parse arguments
const args = process.argv.slice(2);
const clearDb = args.includes('--clear');
const envIndex = args.indexOf('--env');
const env = envIndex !== -1 && args[envIndex + 1] ? args[envIndex + 1] : 'development';

// Set environment
process.env.NODE_ENV = env;

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Warn if running in production
if (env === 'production') {
  rl.question('WARNING: You are about to seed the PRODUCTION database. This will modify data. Continue? (y/N) ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      runSeed();
    } else {
      console.log('Seeding cancelled');
      rl.close();
      process.exit(0);
    }
  });
} else {
  // Confirm before clearing database
  if (clearDb) {
    rl.question(`This will CLEAR ALL DATA in the ${env} database before seeding. Continue? (y/N) `, (answer) => {
      if (answer.toLowerCase() === 'y') {
        runSeed(true);
      } else {
        console.log('Seeding cancelled');
        rl.close();
        process.exit(0);
      }
    });
  } else {
    runSeed(false);
  }
}

async function runSeed(clear = false) {
  console.log(`Starting database seed (Environment: ${env})`);
  console.time('Seeding completed in');
  
  try {
    // Run the seed function from seed.js
    await seedDatabase();
    
    console.timeEnd('Seeding completed in');
    console.log('✓ Database successfully seeded with sample data');
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    rl.close();
    process.exit(1);
  }
}