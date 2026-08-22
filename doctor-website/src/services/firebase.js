import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCWf-EVgGB3py-UiVSbeswu1lWrtb0MfkU",
  authDomain: "ai-health-companion-c8ba6.firebaseapp.com",
  projectId: "ai-health-companion-c8ba6",
  storageBucket: "ai-health-companion-c8ba6.firebasestorage.app",
  messagingSenderId: "704791131195",
  appId: "1:704791131195:web:e75f9bcb16c11b98b0581e",
  measurementId: "G-K0V6699FWT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
