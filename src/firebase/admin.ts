'use server';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// IMPORTANT: DO NOT MODIFY THIS FILE
// This file is used to initialize the Firebase Admin SDK.
// It is intended to be used in server-side code only.

const serviceAccount = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT)
  : undefined;

function getAdminApp(): App {
    if (getApps().length > 0) {
        return getApps()[0];
    }
    
    if (!serviceAccount) {
        throw new Error('FIREBASE_ADMIN_SERVICE_ACCOUNT environment variable is not set. This is required for server-side Firebase operations.');
    }

    return initializeApp({
        credential: cert(serviceAccount),
    });
}

export function initializeAdminApp() {
    const app = getAdminApp();
    return {
        auth: getAuth(app),
        firestore: getFirestore(app),
    };
}
