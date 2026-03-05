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
import type { Goal, GoalProgress } from '@dojodash/core/models';

const CLUBS_COLLECTION = 'clubs';
const GOALS_SUBCOLLECTION = 'goals';
const PROGRESS_SUBCOLLECTION = 'progress';

export async function getGoal(clubId: string, goalId: string): Promise<Goal | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, CLUBS_COLLECTION, clubId, GOALS_SUBCOLLECTION, goalId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Goal;
}

export async function getGoals(clubId: string, groupId?: string): Promise<Goal[]> {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION, clubId, GOALS_SUBCOLLECTION);

  let q;
  if (groupId) {
    q = query(colRef, where('groupId', '==', groupId), where('status', '==', 'active'));
  } else {
    q = query(colRef, where('status', '==', 'active'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Goal);
}

export async function getChildGoals(clubId: string, childId: string): Promise<Goal[]> {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION, clubId, GOALS_SUBCOLLECTION);
  const q = query(colRef, where('childId', '==', childId), where('status', '==', 'active'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Goal);
}

export async function createGoal(
  clubId: string,
  goal: Omit<Goal, 'id' | 'clubId' | 'current' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION, clubId, GOALS_SUBCOLLECTION);
  const docRef = doc(colRef);
  await setDoc(docRef, {
    ...goal,
    clubId,
    current: 0,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateGoal(
  clubId: string,
  goalId: string,
  data: Partial<Omit<Goal, 'id' | 'clubId' | 'createdBy' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, CLUBS_COLLECTION, clubId, GOALS_SUBCOLLECTION, goalId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteGoal(clubId: string, goalId: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, CLUBS_COLLECTION, clubId, GOALS_SUBCOLLECTION, goalId);
  await deleteDoc(docRef);
}

export async function updateGoalProgress(
  clubId: string,
  goalId: string,
  increment: number
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, CLUBS_COLLECTION, clubId, GOALS_SUBCOLLECTION, goalId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return;

  const goal = snapshot.data() as Goal;
  const newCurrent = Math.min(goal.current + increment, goal.target);
  const newStatus = newCurrent >= goal.target ? 'completed' : 'active';

  await updateDoc(docRef, {
    current: newCurrent,
    status: newStatus,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToGoals(
  clubId: string,
  groupId: string | undefined,
  callback: (goals: Goal[]) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION, clubId, GOALS_SUBCOLLECTION);

  let q;
  if (groupId) {
    q = query(colRef, where('groupId', '==', groupId), where('status', '==', 'active'));
  } else {
    q = query(colRef, where('status', '==', 'active'));
  }

  return onSnapshot(q, (snapshot) => {
    const goals = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Goal);
    callback(goals);
  });
}

export async function getGoalProgress(
  clubId: string,
  goalId: string
): Promise<GoalProgress[]> {
  const db = getFirestoreDb();
  const colRef = collection(
    db,
    CLUBS_COLLECTION,
    clubId,
    GOALS_SUBCOLLECTION,
    goalId,
    PROGRESS_SUBCOLLECTION
  );
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((doc) => doc.data() as GoalProgress);
}
