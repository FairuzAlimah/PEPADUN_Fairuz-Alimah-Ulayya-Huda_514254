import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  User,
} from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANAcQLp4lbNrJGN7GlNtNaSvP4e6jQNyY",
  authDomain: "responsi-pgpbl-b0c78.firebaseapp.com",
  databaseURL: "https://responsi-pgpbl-b0c78-default-rtdb.firebaseio.com",
  projectId: "responsi-pgpbl-b0c78",
  storageBucket: "responsi-pgpbl-b0c78.firebasestorage.app",
  messagingSenderId: "76695767488",
  appId: "1:76695767488:web:0bc40272d484f239f22025",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { auth, db };

export async function registerWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function loginAsGuest() {
  return signInAnonymously(auth);
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
