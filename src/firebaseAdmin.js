// src/firebaseAdmin.js
import admin from 'firebase-admin';

// The change is on this line: 'assert' has been replaced by 'with'
import serviceAccount from '../schedule-app-firebase-adminsdk.json' with { type: 'json' };

// Initialize the app if it's not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Export the firestore database instance
export const db = admin.firestore();