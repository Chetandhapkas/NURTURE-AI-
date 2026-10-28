import { initializeApp, getApp, getApps } from "firebase/app";

import {
  getMessaging,
  isSupported
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check required Firebase configuration.
const requiredConfig = [
  "apiKey",
  "projectId",
  "messagingSenderId",
  "appId"
];

const missingConfig = requiredConfig.filter(
  (key) => !firebaseConfig[key]
);

if (missingConfig.length > 0) {
  throw new Error(
    `Missing Firebase configuration: ${missingConfig.join(", ")}. ` +
    "Check your Vercel environment variables and redeploy."
  );
}

// Reuse the existing app if Firebase was initialized already.
const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const getFirebaseMessaging = async () => {
  const supported = await isSupported();

  if (!supported) {
    throw new Error(
      "Firebase notifications are not supported in this browser."
    );
  }

  return getMessaging(app);
};

export const VAPID_KEY =
  import.meta.env.VITE_FIREBASE_VAPID_KEY;
