import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB1n_rUXOQu2isEngAlRJJC90-grz4u_QE",
  authDomain: "quiz-app-b52da.firebaseapp.com",
  projectId: "quiz-app-b52da",
  storageBucket: "quiz-app-b52da.firebasestorage.app",
  messagingSenderId: "1004571735794",
  appId: "1:1004571735794:web:8271ab0173086e1345026b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;