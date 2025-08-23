import { db } from '../firebaseAdmin.js';

const initialSections = {
    'CS': {
        '1st Year': ['CS 1-1', 'CS 1-2', 'CS 1-3', 'CS 1-4', 'CS 1-5'],
        '2nd Year': ['CS 2-1', 'CS 2-2', 'CS 2-3', 'CS 2-4', 'CS 2-5'],
        '3rd Year': ['CS 3-1', 'CS 3-2', 'CS 3-3', 'CS 3-4', 'CS 3-5', 'CS 3-6'],
        '4th Year': ['CS 4-1', 'CS 4-2', 'CS 4-3']
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