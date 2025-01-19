import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC51d105v36uzhqCN8IbL-c4uEVi3wEJjQ",
    authDomain: "sentimentor-97785.firebaseapp.com",
    projectId: "sentimentor-97785",
    storageBucket: "sentimentor-97785.firebasestorage.app",
    messagingSenderId: "13837582359",
    appId: "1:13837582359:web:3e8d55c97b78de11e29c52"
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
