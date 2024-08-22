import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";  // Optional for messaging

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPAGClRDq_tSoYObl5gpLzyF4gx6AZAl8",
  authDomain: "medsafe-67a48.firebaseapp.com",
  projectId: "medsafe-67a48",
  storageBucket: "medsafe-67a48.appspot.com",
  messagingSenderId: "507503158272",
  appId: "1:507503158272:web:a14cea429822ded3d9a4e5",
  measurementId: "G-7KZHR6PF8F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const messaging = getMessaging(app);  // Optional for messaging

export { auth, messaging };
