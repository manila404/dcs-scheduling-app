import admin from 'firebase-admin';
import 'dotenv/config'; // <-- 1. Import and configure dotenv at the very top

// 2. Build the service account object from environment variables
const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  // 3. The private key needs special handling to restore the newlines
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

// 4. Remove the old JSON import, it's no longer needed!
// import serviceAccount from '../schedule-app-firebase-adminsdk.json' with { type: 'json' };

// Initialize the app if it's not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    // 5. Use the dynamically created serviceAccount object
    credential: admin.credential.cert(serviceAccount)
  });
}

// Export the firestore database instance
export const db = admin.firestore();