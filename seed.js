// seed.js

import { seedFaculty } from './src/seeders/seed-Faculty.js';
// 1. Import the new section seeder
import { seedSections } from './src/seeders/seeder-Section.js';

const runSeeders = async () => {
  try {
    console.log('Starting the seeding process...');

    // Call your seeder functions here
    await seedFaculty();
    // 2. Call the new section seeder
    await seedSections();

    console.log('All seeding processes completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('An error occurred during seeding:', error);
    process.exit(1);
  }
};

runSeeders();