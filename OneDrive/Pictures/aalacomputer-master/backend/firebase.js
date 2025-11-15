// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your Firebase config (keep this)
const firebaseConfig = {
  apiKey: "AIzaSyDo5_zOM9DiCRAAFeI6RC9ubniu8XcMEzc",
  authDomain: "aalacomputer-a50b2.firebaseapp.com",
  projectId: "aalacomputer-a50b2",
  storageBucket: "aalacomputer-a50b2.firebasestorage.app",
  messagingSenderId: "784568324253",
  appId: "1:784568324253:web:f8943331098bea48a30474",
  measurementId: "G-D7Q7W5SV3Y"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Setup Auth + Google Provider
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Google Sign-In function
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("User Info:", user);
  } catch (error) {
    console.error("Google Login Error:", error);
    alert("Login failed. Try again.");
  }
};