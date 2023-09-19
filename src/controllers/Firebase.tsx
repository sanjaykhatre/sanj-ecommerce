import { initializeApp } from "firebase/app";
import { app } from "../helpers/config";
import {
  getFirestore,
  getDoc,
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  collectionGroup,
  writeBatch,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const functions = getFunctions(app);
export const auth = getAuth(app);
