import { db } from '../firebaseAdmin.js';

export const seedFaculty = async () => {
  const facultyCollection = db.collection('faculty');
  
  // Updated list of all faculty members in formal name format
  const facultyData = [
    { name: 'Jovelyn Ocampo' },
    { name: 'Ely Rose Panganiban-Briones' },
    { name: 'Donalyn Montallana' },
    { name: 'Steffanie Bato' },
    { name: 'Bryan Ablaza' },
    { name: 'Mikaela Arciaga' },
    { name: 'Stephen Bacolor' },
    { name: 'Jhon Nerick Batuigas' },
    { name: 'Edan Belgica' },
    { name: 'Ralph Christian Bolarda' },
    { name: 'Rafael Carvajal' },
    { name: 'Jerico Castillo' },
    { name: 'Mariel Castillo' },
    { name: 'Alvin Celino' },
    { name: 'Allen Dave Coles' },
    { name: 'Redem Decipulo' },
    { name: 'Rufino Dela Cruz' },
    { name: 'Jen Jerome Dela Pena' },
    { name: 'Roi Francisco' },
    { name: 'Lawrence Jimenez' },
    { name: 'James Mañozo' },
    { name: 'Ashley Manuel' },
    { name: 'Edmund Martinez' },
    { name: 'Julios Mojas' },
    { name: 'Richard Ongayo' },
    { name: 'Aida Penson' },
    { name: 'Nestor Migule Pimentel' },
    { name: 'Jr Racadio' },
    { name: 'Joven Rios' },
    { name: 'Nino Rodil' },
    { name: 'Rachel Rodriguez' },
    { name: 'Jessica Ann Sambrano' },
    { name: 'Benedick Sarmiento' },
    { name: 'Jerome Tacata' },
    { name: 'Pamela Tagum' },
    { name: 'Cesar Talibong' },
    { name: 'Russel Villareal' }
  ];

  console.log('Seeding faculty with formal names...');
  const promises = facultyData.map(async (faculty) => {
    // Using the name as the document ID to prevent duplicates
    await facultyCollection.doc(faculty.name).set(faculty);
  });

  await Promise.all(promises);
  console.log('✅ Faculty seeding complete! All members have been updated to formal names.');
};