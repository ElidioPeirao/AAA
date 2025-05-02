import  { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCz8u7hif6m2s7S6cibOSdnT7luQRhO6bA",
  authDomain: "dataserver-5d143.firebaseapp.com",
  projectId: "dataserver-5d143",
  storageBucket: "dataserver-5d143.appspot.com",
  messagingSenderId: "823451234978",
  appId: "1:206102063612:web:7da11092f4a7e8d3a06a79",
  measurementId: "G-FP4E53Z6YE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
 