import {
  getFirestoreDb,
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
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from '../client/firestore';
import type { Club, ChildPublic } from '@dojodash/core';
import { DEFAULT_CLUB_SETTINGS } from '@dojodash/core';

const CLUBS_COLLECTION = 'clubs';
const CHILDREN_PUBLIC_SUBCOLLECTION = 'childrenPublic';

export async function getClub(clubId: string): Promise<Club | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, CLUBS_COLLECTION, clubId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Club;
}

export async function getClubs(clubIds: string[]): Promise<Club[]> {
  if (clubIds.length === 0) return [];
  const results = await Promise.all(clubIds.map(getClub));
  return results.filter((c): c is Club => c !== null);
}

export async function getAllClubs(): Promise<Club[]> {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION);
  const q = query(colRef, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Club);
}

export async function createClub(
  club: Omit<Club, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION);
  const docRef = doc(colRef);
  await setDoc(docRef, {
    ...club,
    settings: { ...DEFAULT_CLUB_SETTINGS, ...club.settings },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateClub(
  clubId: string,
  data: Partial<Omit<Club, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, CLUBS_COLLECTION, clubId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteClub(clubId: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, CLUBS_COLLECTION, clubId);
  await deleteDoc(docRef);
}

export function subscribeToClub(
  clubId: string,
  callback: (club: Club | null) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const docRef = doc(db, CLUBS_COLLECTION, clubId);
  return onSnapshot(docRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback({ id: snapshot.id, ...snapshot.data() } as Club);
  });
}

export async function getClubBySlug(slug: string): Promise<Club | null> {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION);
  const q = query(colRef, where('slug', '==', slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0]!;
  return { id: doc.id, ...doc.data() } as Club;
}

export async function getChildrenPublic(clubId: string, groupId?: string): Promise<ChildPublic[]> {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION, clubId, CHILDREN_PUBLIC_SUBCOLLECTION);
  let q;
  if (groupId) {
    q = query(colRef, where('groupId', '==', groupId));
  } else {
    q = query(colRef);
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ChildPublic);
}

export function subscribeToChildrenPublic(
  clubId: string,
  groupId: string | undefined,
  callback: (children: ChildPublic[]) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION, clubId, CHILDREN_PUBLIC_SUBCOLLECTION);
  let q;
  if (groupId) {
    q = query(colRef, where('groupId', '==', groupId));
  } else {
    q = query(colRef);
  }
  return onSnapshot(q, (snapshot) => {
    const children = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ChildPublic);
    callback(children);
  });
}
