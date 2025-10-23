// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-wvBnO4y_TsDuGwd7SjzGrlN-0or3J8I",
  authDomain: "carvohub-b70a7.firebaseapp.com",
  projectId: "carvohub-b70a7",
  storageBucket: "carvohub-b70a7.firebasestorage.app",
  messagingSenderId: "155607601017",
  appId: "1:155607601017:web:cad27ea106209a877b69a8",
  measurementId: "G-LMTR1Q33YQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup, signOut };