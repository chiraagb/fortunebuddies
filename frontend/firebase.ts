// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkbF8GbYFroO3VUK9jIxgBCVXPtBFi2kA",
  authDomain: "gatherbite-21710.firebaseapp.com",
  projectId: "gatherbite-21710",
  storageBucket: "gatherbite-21710.firebasestorage.app",
  messagingSenderId: "1032479898618",
  appId: "1:1032479898618:web:a8cba6e1c63a9fe67e0243",
  measurementId: "G-3JS136W0PY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
