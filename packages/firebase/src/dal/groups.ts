import {
  getFirestoreDb,
  collection,
  collectionGroup,
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
import type { Group, GroupMember, GroupInvite } from '@dojodash/core';

const CLUBS_COLLECTION = 'clubs';
const GROUPS_SUBCOLLECTION = 'groups';
const MEMBERS_SUBCOLLECTION = 'members';
const INVITES_SUBCOLLECTION = 'invites';

export async function getGroup(clubId: string, groupId: string): Promise<Group | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, CLUBS_COLLECTION, clubId, GROUPS_SUBCOLLECTION, groupId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Group;
}

export async function getGroups(clubId: string): Promise<Group[]> {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION, clubId, GROUPS_SUBCOLLECTION);
  const q = query(colRef, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Group);
}

export async function createGroup(
  clubId: string,
  group: Omit<Group, 'id' | 'clubId' | 'memberCount' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION, clubId, GROUPS_SUBCOLLECTION);
  const docRef = doc(colRef);
  await setDoc(docRef, {
    ...group,
    clubId,
    memberCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateGroup(
  clubId: string,
  groupId: string,
  data: Partial<Omit<Group, 'id' | 'clubId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, CLUBS_COLLECTION, clubId, GROUPS_SUBCOLLECTION, groupId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteGroup(clubId: string, groupId: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, CLUBS_COLLECTION, clubId, GROUPS_SUBCOLLECTION, groupId);
  await deleteDoc(docRef);
}

export function subscribeToGroups(
  clubId: string,
  callback: (groups: Group[]) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const colRef = collection(db, CLUBS_COLLECTION, clubId, GROUPS_SUBCOLLECTION);
  const q = query(colRef, orderBy('name'));
  return onSnapshot(q, (snapshot) => {
    const groups = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Group);
    callback(groups);
  });
}

export async function getGroupMembers(clubId: string, groupId: string): Promise<GroupMember[]> {
  const db = getFirestoreDb();
  const colRef = collection(
    db,
    CLUBS_COLLECTION,
    clubId,
    GROUPS_SUBCOLLECTION,
    groupId,
    MEMBERS_SUBCOLLECTION
  );
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((doc) => doc.data() as GroupMember);
}

export async function addGroupMember(
  clubId: string,
  groupId: string,
  member: GroupMember
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(
    db,
    CLUBS_COLLECTION,
    clubId,
    GROUPS_SUBCOLLECTION,
    groupId,
    MEMBERS_SUBCOLLECTION,
    member.childId
  );
  await setDoc(docRef, member);

  const groupRef = doc(db, CLUBS_COLLECTION, clubId, GROUPS_SUBCOLLECTION, groupId);
  const groupSnap = await getDoc(groupRef);
  if (groupSnap.exists()) {
    const currentCount = (groupSnap.data() as Group).memberCount || 0;
    await updateDoc(groupRef, { memberCount: currentCount + 1 });
  }
}

export async function removeGroupMember(
  clubId: string,
  groupId: string,
  childId: string
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(
    db,
    CLUBS_COLLECTION,
    clubId,
    GROUPS_SUBCOLLECTION,
    groupId,
    MEMBERS_SUBCOLLECTION,
    childId
  );
  await deleteDoc(docRef);

  const groupRef = doc(db, CLUBS_COLLECTION, clubId, GROUPS_SUBCOLLECTION, groupId);
  const groupSnap = await getDoc(groupRef);
  if (groupSnap.exists()) {
    const currentCount = (groupSnap.data() as Group).memberCount || 0;
    await updateDoc(groupRef, { memberCount: Math.max(0, currentCount - 1) });
  }
}

export function subscribeToGroupMembers(
  clubId: string,
  groupId: string,
  callback: (members: GroupMember[]) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const colRef = collection(
    db,
    CLUBS_COLLECTION,
    clubId,
    GROUPS_SUBCOLLECTION,
    groupId,
    MEMBERS_SUBCOLLECTION
  );
  return onSnapshot(colRef, (snapshot) => {
    const members = snapshot.docs.map((doc) => doc.data() as GroupMember);
    callback(members);
  });
}

// Generate a random invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createGroupInvite(
  clubId: string,
  groupId: string,
  createdBy: string,
  expiresInDays = 7,
  maxUses = 10
): Promise<GroupInvite> {
  const db = getFirestoreDb();
  const colRef = collection(
    db,
    CLUBS_COLLECTION,
    clubId,
    GROUPS_SUBCOLLECTION,
    groupId,
    INVITES_SUBCOLLECTION
  );
  const docRef = doc(colRef);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const invite: Omit<GroupInvite, 'id'> = {
    clubId,
    groupId,
    code: generateInviteCode(),
    createdBy,
    expiresAt: { seconds: Math.floor(expiresAt.getTime() / 1000), nanoseconds: 0 },
    maxUses,
    usedCount: 0,
    createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
  };

  await setDoc(docRef, invite);

  return { id: docRef.id, ...invite };
}

export async function getInviteByCode(code: string): Promise<GroupInvite | null> {
  const db = getFirestoreDb();

  // Use collection group query for efficient lookup across all invites
  const invitesQuery = query(
    collectionGroup(db, INVITES_SUBCOLLECTION),
    where('code', '==', code)
  );

  const snapshot = await getDocs(invitesQuery);

  if (snapshot.empty) {
    return null;
  }

  const inviteDoc = snapshot.docs[0];
  if (!inviteDoc) {
    return null;
  }

  return { id: inviteDoc.id, ...inviteDoc.data() } as GroupInvite;
}

export async function incrementInviteUsedCount(
  clubId: string,
  groupId: string,
  inviteId: string
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(
    db,
    CLUBS_COLLECTION,
    clubId,
    GROUPS_SUBCOLLECTION,
    groupId,
    INVITES_SUBCOLLECTION,
    inviteId
  );
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    const data = snapshot.data() as GroupInvite;
    await updateDoc(docRef, { usedCount: (data.usedCount || 0) + 1 });
  }
}
