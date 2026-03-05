import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type Firestore,
  type DocumentReference,
  type CollectionReference,
  type Query,
  type QueryConstraint,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseApp } from './app';
import { isEmulatorMode } from './config';

let db: Firestore | undefined;
let emulatorConnected = false;

export function getFirestoreDb(): Firestore {
  if (db) return db;

  const app = getFirebaseApp();
  db = getFirestore(app);

  if (isEmulatorMode() && !emulatorConnected && typeof window !== 'undefined') {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    emulatorConnected = true;
  }

  return db;
}

export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type DocumentReference,
  type CollectionReference,
  type Query,
  type QueryConstraint,
  type DocumentData,
  type Unsubscribe,
};
