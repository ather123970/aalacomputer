// Lightweight Firebase client initializer for frontend use
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDo5_zOM9DiCRAAFeI6RC9ubniu8XcMEzc',
  authDomain: 'aalacomputer-a50b2.firebaseapp.com',
  projectId: 'aalacomputer-a50b2',
  storageBucket: 'aalacomputer-a50b2.firebasestorage.app',
  messagingSenderId: '784568324253',
  appId: '1:784568324253:web:f8943331098bea48a30474',
  measurementId: 'G-D7Q7W5SV3Y',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
