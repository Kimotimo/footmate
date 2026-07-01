import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA93zxgv5_9iVo-sZi8UePMnLFgBMn8JGM",
  authDomain: "footmate-4694a.firebaseapp.com",
  projectId: "footmate-4694a",
  storageBucket: "footmate-4694a.firebasestorage.app",
  messagingSenderId: "85913169427",
  appId: "1:85913169427:web:75726c752fe803f484d9e6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);