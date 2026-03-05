import {
  getFirestoreDb,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from '../client/firestore';
import type { User, Child, ChildPrivacy, Notification } from '@dojodash/core';

const USERS_COLLECTION = 'users';
const CHILDREN_SUBCOLLECTION = 'children';
const NOTIFICATIONS_SUBCOLLECTION = 'notifications';

export async function getUser(uid: string): Promise<User | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, USERS_COLLECTION, uid);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { uid: snapshot.id, ...snapshot.data() } as User;
}

export async function createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, USERS_COLLECTION, user.uid);
  await setDoc(docRef, {
    ...user,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUser(
  uid: string,
  data: Partial<Omit<User, 'uid' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToUser(uid: string, callback: (user: User | null) => void): Unsubscribe {
  const db = getFirestoreDb();
  const docRef = doc(db, USERS_COLLECTION, uid);
  return onSnapshot(docRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback({ uid: snapshot.id, ...snapshot.data() } as User);
  });
}

export async function getChildren(parentUid: string): Promise<Child[]> {
  const db = getFirestoreDb();
  const colRef = collection(db, USERS_COLLECTION, parentUid, CHILDREN_SUBCOLLECTION);
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Child);
}

export async function getChild(parentUid: string, childId: string): Promise<Child | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, USERS_COLLECTION, parentUid, CHILDREN_SUBCOLLECTION, childId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Child;
}

export async function createChild(
  parentUid: string,
  child: Omit<Child, 'id' | 'parentUid' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const db = getFirestoreDb();
  const colRef = collection(db, USERS_COLLECTION, parentUid, CHILDREN_SUBCOLLECTION);
  const docRef = doc(colRef);
  await setDoc(docRef, {
    ...child,
    parentUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateChild(
  parentUid: string,
  childId: string,
  data: Partial<Omit<Child, 'id' | 'parentUid' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, USERS_COLLECTION, parentUid, CHILDREN_SUBCOLLECTION, childId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function updateChildPrivacy(
  parentUid: string,
  childId: string,
  privacy: Partial<ChildPrivacy>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, USERS_COLLECTION, parentUid, CHILDREN_SUBCOLLECTION, childId);
  await updateDoc(docRef, {
    'privacy.showOnLeaderboard': privacy.showOnLeaderboard,
    'privacy.showFullName': privacy.showFullName,
    'privacy.showPhoto': privacy.showPhoto,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToChildren(
  parentUid: string,
  callback: (children: Child[]) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const colRef = collection(db, USERS_COLLECTION, parentUid, CHILDREN_SUBCOLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const children = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Child);
    callback(children);
  });
}

export async function getNotifications(
  userId: string,
  limitCount = 50
): Promise<Notification[]> {
  const db = getFirestoreDb();
  const colRef = collection(db, USERS_COLLECTION, userId, NOTIFICATIONS_SUBCOLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.slice(0, limitCount).map((doc) => ({ id: doc.id, ...doc.data() }) as Notification);
}

export async function markNotificationRead(userId: string, notificationId: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, USERS_COLLECTION, userId, NOTIFICATIONS_SUBCOLLECTION, notificationId);
  await updateDoc(docRef, { read: true });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const db = getFirestoreDb();
  const colRef = collection(db, USERS_COLLECTION, userId, NOTIFICATIONS_SUBCOLLECTION);
  const q = query(colRef, where('read', '==', false));
  const snapshot = await getDocs(q);
  const updates = snapshot.docs.map((d) =>
    updateDoc(doc(db, USERS_COLLECTION, userId, NOTIFICATIONS_SUBCOLLECTION, d.id), { read: true })
  );
  await Promise.all(updates);
}

export function subscribeToNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const colRef = collection(db, USERS_COLLECTION, userId, NOTIFICATIONS_SUBCOLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Notification);
    callback(notifications);
  });
}
