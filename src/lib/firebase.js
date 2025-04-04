import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore"; // Firestore imports

const firebaseConfig = {
  apiKey: "AIzaSyDZMCpQEb5ayYJXdhy2COTn3CYptYSVrjE",
  authDomain: "meibeichi.firebaseapp.com",
  projectId: "meibeichi",
  storageBucket: "meibeichi.firebasestorage.app",
  messagingSenderId: "90309491677",
  appId: "1:90309491677:web:2c795b641cc4e506b89434"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Khởi tạo Firestore

export { db, collection, addDoc }; // Export Firestore functions