// Lightweight Firebase client initializer for frontend use
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD1rar0iBmLO7ipINM8p0_z2Hc-k-q1NOY",
  authDomain: "mywebaap-8b758.firebaseapp.com",
  projectId: "mywebaap-8b758",
  storageBucket: "mywebaap-8b758.firebasestorage.app",
  messagingSenderId: "1031950836780",
  appId: "1:1031950836780:web:94b4563401e7d7f9bfdd89",
  measurementId: "G-0ER9EK6J3K"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
