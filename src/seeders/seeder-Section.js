import { db } from '../firebaseAdmin.js';

const initialSections = {
    'IT': {
        '1st Year': ['IT 1A', 'IT 1B'],
        '2nd Year': ['IT 2A', 'IT 2B'],
        '3rd Year': ['IT 3A'],
        '4th Year': ['IT 4A']
    },
    'CS': {
        '1st Year': ['CS 1A', 'CS 1B'],
        '2nd Year': ['CS 2A'],
        '3rd Year': ['CS 3A', 'CS 3B'],
        '4th Year': ['CS 4A']
    }
};

export const seedSections = async () => {
  console.log('Starting to seed sections...');
  const sectionsCollection = db.collection('sections');
  const promises = [];

  // Loop through each program (e.g., 'IT', 'CS')
  for (const program in initialSections) {
    // Loop through each year level (e.g., '1st Year')
    for (const yearLevel in initialSections[program]) {
      const sectionNames = initialSections[program][yearLevel];
      
      // We'll use a descriptive document ID like 'IT-1st Year'
      // This makes the seeder safe to run multiple times without creating duplicates.
      const docId = `${program}-${yearLevel}`;
      const docRef = sectionsCollection.doc(docId);
      
      const promise = docRef.set({
        program: program,
        yearLevel: yearLevel,
        // Store the section names in an array field
        sectionNames: sectionNames
      });
      
      promises.push(promise);
      console.log(`Preparing to seed sections for: ${docId}`);
    }
  }

  // Wait for all the write operations to complete
  await Promise.all(promises);
  console.log('✅ Section seeding complete!');
};