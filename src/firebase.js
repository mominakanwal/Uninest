// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDn3PLIJMTduT0G5tOtjP07Zkb8rxiw01M",
  authDomain: "prototype-6d8b6.firebaseapp.com",
  projectId: "prototype-6d8b6",
  storageBucket: "prototype-6d8b6.appspot.com",  // Fixed typo here
  messagingSenderId: "420533357677",
  appId: "1:420533357677:web:62a82aa11e968324af0364",
  measurementId: "G-RYHHE6W73L"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
