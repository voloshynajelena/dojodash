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
  Timestamp,
  writeBatch,
  type Unsubscribe,
} from '../client/firestore';
import type { Session, SessionRecurrence } from '@dojodash/core';

const CLUBS_COLLECTION = 'clubs';
const SESSIONS_SUBCOLLECTION = 'sessions';
const RECURRENCES_SUBCOLLECTION = 'recurrences';

export async function getSession(clubId: string, sessionId: string): Promise<Session | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, CLUBS_COLLECTION, clubId, SESSIONS_SUBCOLLECTION, sessionId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Session;
}

export async function getSessions(
  clubId: string,
  groupId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<Session[]> {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION, clubId, SESSIONS_SUBCOLLECTION);

  const constraints = [];
  if (groupId) {
    constraints.push(where('groupId', '==', groupId));
  }
  if (startDate) {
    constraints.push(where('date', '>=', Timestamp.fromDate(startDate)));
  }
  if (endDate) {
    constraints.push(where('date', '<=', Timestamp.fromDate(endDate)));
  }
  constraints.push(orderBy('date', 'asc'));

  const q = query(colRef, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Session);
}

export async function getUpcomingSessions(clubId: string, groupId?: string): Promise<Session[]> {
  const now = new Date();
  return getSessions(clubId, groupId, now);
}

export async function createSession(
  clubId: string,
  session: Omit<Session, 'id' | 'clubId' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION, clubId, SESSIONS_SUBCOLLECTION);
  const docRef = doc(colRef);
  await setDoc(docRef, {
    ...session,
    clubId,
    status: 'scheduled',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function createSessionsBatch(
  clubId: string,
  sessions: Omit<Session, 'id' | 'clubId' | 'status' | 'createdAt' | 'updatedAt'>[]
): Promise<string[]> {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION, clubId, SESSIONS_SUBCOLLECTION);
  const ids: string[] = [];

  // Firestore batch limit is 500 operations
  const BATCH_SIZE = 500;

  for (let i = 0; i < sessions.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = sessions.slice(i, i + BATCH_SIZE);

    for (const session of chunk) {
      const docRef = doc(colRef);
      ids.push(docRef.id);
      batch.set(docRef, {
        ...session,
        clubId,
        status: 'scheduled',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
  }

  return ids;
}

export async function updateSession(
  clubId: string,
  sessionId: string,
  data: Partial<Omit<Session, 'id' | 'clubId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, CLUBS_COLLECTION, clubId, SESSIONS_SUBCOLLECTION, sessionId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function cancelSession(
  clubId: string,
  sessionId: string,
  reason?: string
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, CLUBS_COLLECTION, clubId, SESSIONS_SUBCOLLECTION, sessionId);
  await updateDoc(docRef, {
    status: 'cancelled',
    notes: reason,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSession(clubId: string, sessionId: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, CLUBS_COLLECTION, clubId, SESSIONS_SUBCOLLECTION, sessionId);
  await deleteDoc(docRef);
}

export async function deleteSessionsBatch(clubId: string, sessionIds: string[]): Promise<void> {
  const db = getFirestoreDb();
  const BATCH_SIZE = 500;

  for (let i = 0; i < sessionIds.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = sessionIds.slice(i, i + BATCH_SIZE);

    for (const sessionId of chunk) {
      const docRef = doc(db, CLUBS_COLLECTION, clubId, SESSIONS_SUBCOLLECTION, sessionId);
      batch.delete(docRef);
    }

    await batch.commit();
  }
}

export function subscribeToSessions(
  clubId: string,
  groupId: string | undefined,
  callback: (sessions: Session[]) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION, clubId, SESSIONS_SUBCOLLECTION);

  let q;
  if (groupId) {
    q = query(colRef, where('groupId', '==', groupId), orderBy('date', 'asc'));
  } else {
    q = query(colRef, orderBy('date', 'asc'));
  }

  return onSnapshot(q, (snapshot) => {
    const sessions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Session);
    callback(sessions);
  });
}

export async function getRecurrences(clubId: string, groupId?: string): Promise<SessionRecurrence[]> {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION, clubId, RECURRENCES_SUBCOLLECTION);

  let q;
  if (groupId) {
    q = query(colRef, where('groupId', '==', groupId));
  } else {
    q = query(colRef);
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as SessionRecurrence);
}

export async function createRecurrence(
  clubId: string,
  recurrence: Omit<SessionRecurrence, 'id' | 'clubId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION, clubId, RECURRENCES_SUBCOLLECTION);
  const docRef = doc(colRef);
  await setDoc(docRef, {
    ...recurrence,
    clubId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateRecurrence(
  clubId: string,
  recurrenceId: string,
  data: Partial<Omit<SessionRecurrence, 'id' | 'clubId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, CLUBS_COLLECTION, clubId, RECURRENCES_SUBCOLLECTION, recurrenceId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteRecurrence(clubId: string, recurrenceId: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, CLUBS_COLLECTION, clubId, RECURRENCES_SUBCOLLECTION, recurrenceId);
  await deleteDoc(docRef);
}
