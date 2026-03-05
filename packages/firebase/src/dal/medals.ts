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
import type { MedalTemplate, Medal } from '@dojodash/core';

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

// Award or transfer a championship medal - only one holder at a time
export async function awardChampionshipMedal(
  clubId: string,
  templateId: string,
  toChildId: string,
  toChildName: string,
  groupId: string,
  awardedBy: string,
  reason?: string
): Promise<{ medalId: string; wasTransferred: boolean; previousHolderId?: string }> {
  const db = getFirestoreDb();

  // Get the template
  const templateRef = doc(db, CLUBS_COLLECTION, clubId, MEDAL_TEMPLATES_SUBCOLLECTION, templateId);
  const templateSnap = await getDoc(templateRef);
  if (!templateSnap.exists()) throw new Error('Medal template not found');

  const template = templateSnap.data() as MedalTemplate;
  if (!template.isChampionship) throw new Error('Template is not a championship medal');

  const colRef = collection(db, CLUBS_COLLECTION, clubId, MEDALS_SUBCOLLECTION);
  const now = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };

  // Check if there's a current holder
  if (template.currentHolderId) {
    // Find the existing medal and transfer it
    const existingQuery = query(
      colRef,
      where('templateId', '==', templateId),
      where('childId', '==', template.currentHolderId)
    );
    const existingSnap = await getDocs(existingQuery);
    const existingDocs = existingSnap.docs;

    if (existingDocs.length > 0) {
      const existingMedal = existingDocs[0]!;
      const medalData = existingMedal.data() as Medal;

      // Update the medal with transfer
      const transfer = {
        fromChildId: template.currentHolderId,
        toChildId,
        transferredBy: awardedBy,
        transferredAt: now,
        reason,
      };

      await updateDoc(existingMedal.ref, {
        childId: toChildId,
        transferHistory: [...(medalData.transferHistory || []), transfer],
      });

      // Update template with new holder
      await updateDoc(templateRef, {
        currentHolderId: toChildId,
        currentHolderName: toChildName,
        updatedAt: serverTimestamp(),
      });

      return {
        medalId: existingMedal.id,
        wasTransferred: true,
        previousHolderId: template.currentHolderId,
      };
    }
  }

  // No current holder - create new medal
  const docRef = doc(colRef);
  const medalData: Omit<Medal, 'id'> = {
    templateId,
    childId: toChildId,
    clubId,
    groupId,
    name: template.name,
    description: template.description,
    color: template.color,
    xpValue: template.xpValue,
    category: template.category,
    awardedBy,
    awardedAt: now,
    reason,
    isChampionship: true,
    customText: template.customText,
    shape: template.shape,
    borderStyle: template.borderStyle,
  };

  await setDoc(docRef, medalData);

  // Update template with current holder
  await updateDoc(templateRef, {
    currentHolderId: toChildId,
    currentHolderName: toChildName,
    updatedAt: serverTimestamp(),
  });

  return {
    medalId: docRef.id,
    wasTransferred: false,
  };
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
