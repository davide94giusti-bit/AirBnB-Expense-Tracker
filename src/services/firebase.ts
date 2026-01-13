import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  projectId: "airbnb-expense-tracker-7f531",
  databaseURL: "https://airbnb-expense-tracker-7f531-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "airbnb-expense-tracker-7f531.firebasestorage.app",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, "us-central1");

if (import.meta.env.DEV) {
  try {
    connectFunctionsEmulator(functions, "localhost", 5001);
  } catch (e) {
    // ignore if already connected
  }
}

export default app;
