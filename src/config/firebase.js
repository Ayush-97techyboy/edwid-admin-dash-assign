import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC7W09bzP_Cq3js0P16cbpdfmuNlnFTEqM",
  authDomain: "edwid-blog-data.firebaseapp.com",
  projectId: "edwid-blog-data",
  storageBucket: "edwid-blog-data.firebasestorage.app",
  messagingSenderId: "955809407468",
  appId: "1:955809407468:web:df532f04430c3c1171e0c9",
  measurementId: "G-QCTKX361LL"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = 'edwid-assessment-v1';
