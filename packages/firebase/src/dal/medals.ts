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
import type { MedalTemplate, Medal } from '@dojodash/core/models';

const CLUBS_COLLECTION = 'clubs';
const MEDAL_TEMPLATES_SUBCOLLECTION = 'medalTemplates';
const MEDALS_SUBCOLLECTION = 'medals';

export async function getMedalTemplate(
  clubId: string,
  templateId: string
): Promise<MedalTemplate | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, CLUBS_COLLECTION, clubId, MEDAL_TEMPLATES_SUBCOLLECTION, templateId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as MedalTemplate;
}

export async function getMedalTemplates(clubId: string): Promise<MedalTemplate[]> {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION, clubId, MEDAL_TEMPLATES_SUBCOLLECTION);
  const q = query(colRef, where('isActive', '==', true), orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as MedalTemplate);
}

export async function createMedalTemplate(
  clubId: string,
  template: Omit<MedalTemplate, 'id' | 'clubId' | 'isActive' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION, clubId, MEDAL_TEMPLATES_SUBCOLLECTION);
  const docRef = doc(colRef);
  await setDoc(docRef, {
    ...template,
    clubId,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateMedalTemplate(
  clubId: string,
  templateId: string,
  data: Partial<Omit<MedalTemplate, 'id' | 'clubId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, CLUBS_COLLECTION, clubId, MEDAL_TEMPLATES_SUBCOLLECTION, templateId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deactivateMedalTemplate(
  clubId: string,
  templateId: string
): Promise<void> {
  await updateMedalTemplate(clubId, templateId, { isActive: false });
}

export function subscribeToMedalTemplates(
  clubId: string,
  callback: (templates: MedalTemplate[]) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION, clubId, MEDAL_TEMPLATES_SUBCOLLECTION);
  const q = query(colRef, where('isActive', '==', true), orderBy('name'));
  return onSnapshot(q, (snapshot) => {
    const templates = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as MedalTemplate);
    callback(templates);
  });
}

export async function getMedal(clubId: string, medalId: string): Promise<Medal | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, CLUBS_COLLECTION, clubId, MEDALS_SUBCOLLECTION, medalId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Medal;
}

export async function getChildMedals(clubId: string, childId: string): Promise<Medal[]> {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION, clubId, MEDALS_SUBCOLLECTION);
  const q = query(colRef, where('childId', '==', childId), orderBy('awardedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Medal);
}

export async function getGroupMedals(clubId: string, groupId: string): Promise<Medal[]> {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION, clubId, MEDALS_SUBCOLLECTION);
  const q = query(colRef, where('groupId', '==', groupId), orderBy('awardedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Medal);
}

export async function awardMedal(
  clubId: string,
  medal: Omit<Medal, 'id'>
): Promise<string> {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION, clubId, MEDALS_SUBCOLLECTION);
  const docRef = doc(colRef);
  await setDoc(docRef, medal);
  return docRef.id;
}

export async function transferMedal(
  clubId: string,
  medalId: string,
  toChildId: string,
  transferredBy: string,
  reason?: string
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, CLUBS_COLLECTION, clubId, MEDALS_SUBCOLLECTION, medalId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) throw new Error('Medal not found');

  const medal = snapshot.data() as Medal;
  const transfer = {
    fromChildId: medal.childId,
    toChildId,
    transferredBy,
    transferredAt: serverTimestamp(),
    reason,
  };

  await updateDoc(docRef, {
    childId: toChildId,
    transferHistory: [...(medal.transferHistory || []), transfer],
  });
}

export function subscribeToChildMedals(
  clubId: string,
  childId: string,
  callback: (medals: Medal[]) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION, clubId, MEDALS_SUBCOLLECTION);
  const q = query(colRef, where('childId', '==', childId), orderBy('awardedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const medals = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Medal);
    callback(medals);
  });
}
