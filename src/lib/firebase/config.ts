/**
 * Firebase Configuration
 * تكوين Firebase
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import {
  getFirestore,
  Firestore,
  connectFirestoreEmulator,
  disableNetwork,
  enableNetwork,
} from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFunctions, Functions } from "firebase/functions";
import { CONFIG } from "../config";

// Firebase configuration
const firebaseConfig = {
  apiKey: CONFIG.firebase.apiKey,
  authDomain: CONFIG.firebase.authDomain,
  projectId: CONFIG.firebase.projectId,
  storageBucket: CONFIG.firebase.storageBucket,
  messagingSenderId: CONFIG.firebase.messagingSenderId,
  appId: CONFIG.firebase.appId,
  measurementId: CONFIG.firebase.measurementId,
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app);

// Initialize Analytics (only in browser)
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { analytics };

// Development mode setup
if (process.env.NODE_ENV === "development") {
  // Connect to Firestore emulator if running locally
  try {
    // Only connect if emulator is actually running
    if (process.env.FIREBASE_EMULATOR_HOST) {
      connectFirestoreEmulator(db, "localhost", 8080);
      console.log("✅ Connected to Firestore emulator");
    } else {
      console.log("ℹ️ Firestore emulator not configured, using production Firestore");
    }
  } catch (error) {
    // Emulator already connected or not available
    console.log("ℹ️ Firestore emulator not available or already connected");
  }
}

// Network management for offline support
export const disableFirestoreNetwork = () => disableNetwork(db);
export const enableFirestoreNetwork = () => enableNetwork(db);

// Retry operation utility for Firebase operations
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`🔄 Retry attempt ${attempt}/${maxRetries} after ${delay}ms delay`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// Export the app instance
export default app;
