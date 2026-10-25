import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyCJCtez2laOINuJSpACC7jbNhKMHIpzhnI",
  authDomain: "complete-auth-with-react.firebaseapp.com",
  projectId: "complete-auth-with-react",
  storageBucket: "complete-auth-with-react.firebasestorage.app",
  messagingSenderId: "1083671681040",
  appId: "1:1083671681040:web:afe71d94b7dd939274d295"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);