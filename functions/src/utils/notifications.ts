import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type { NotificationType, NotificationData } from '@dojodash/core';

export interface NotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationData;
}

export async function createNotification(input: NotificationInput): Promise<string> {
  const db = getFirestore();
  const docRef = db
    .collection('users')
    .doc(input.userId)
    .collection('notifications')
    .doc();

  await docRef.set({
    type: input.type,
    title: input.title,
    body: input.body,
    data: input.data ?? {},
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  });

  return docRef.id;
}

export async function createNotificationsForUsers(
  userIds: string[],
  notification: Omit<NotificationInput, 'userId'>
): Promise<void> {
  const promises = userIds.map((userId) =>
    createNotification({ ...notification, userId })
  );
  await Promise.all(promises);
}

export async function notifyClubFamilies(
  clubId: string,
  groupId: string,
  notification: Omit<NotificationInput, 'userId'>
): Promise<void> {
  const db = getFirestore();

  const membersSnapshot = await db
    .collection('clubs')
    .doc(clubId)
    .collection('groups')
    .doc(groupId)
    .collection('members')
    .get();

  const parentUids = new Set<string>();
  membersSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (data.parentUid) {
      parentUids.add(data.parentUid);
    }
  });

  await createNotificationsForUsers([...parentUids], notification);
}
