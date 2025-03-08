#!/usr/bin/env node
const seedDatabase = require('./src/db/seed');

// Set up handling for termination signals
process.on('SIGINT', () => {
  console.log('Script interrupted');
  process.exit(0);
});

// Run the seed function
console.log('Starting database seeding process...');
seedDatabase()
  .then(() => {
    console.log('Database seeding completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error seeding database:', err);
    process.exit(1);
  });