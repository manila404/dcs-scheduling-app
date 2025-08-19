
import { seedFaculty } from './src/seeders/seed-Faculty.js';
import { seedSections } from './src/seeders/seeder-Section.js';

const runSeeders = async () => {
  try {
    console.log('Starting the seeding process...');

    await seedFaculty();
    await seedSections();

    console.log('All seeding processes completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('An error occurred during seeding:', error);
    process.exit(1);
  }
};

runSeeders();