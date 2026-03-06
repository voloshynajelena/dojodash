import { onDocumentCreated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { createNotification } from '../utils/notifications';

interface GroupMemberData {
  childId: string;
  childName: string;
  parentUid: string;
  parentEmail?: string;
  joinedAt: FirebaseFirestore.Timestamp;
}

/**
 * When a member is added to a group, notify coaches and the family
 */
export const onGroupMemberCreate = onDocumentCreated(
  'clubs/{clubId}/groups/{groupId}/members/{memberId}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const memberData = snapshot.data() as GroupMemberData;
    const { clubId, groupId } = event.params;

    const db = getFirestore();

    // Get group and club names
    const [groupDoc, clubDoc] = await Promise.all([
      db.collection('clubs').doc(clubId).collection('groups').doc(groupId).get(),
      db.collection('clubs').doc(clubId).get(),
    ]);
    const groupName = groupDoc.data()?.name || 'Unknown Group';
    const clubName = clubDoc.data()?.name || 'the club';

    // Get coaches for this club
    const coachesSnapshot = await db
      .collection('users')
      .where('role', '==', 'COACH')
      .where('clubIds', 'array-contains', clubId)
      .get();

    // Notify each coach
    const coachNotifications = coachesSnapshot.docs.map(async (coachDoc) => {
      try {
        await createNotification({
          userId: coachDoc.id,
          type: 'member_joined',
          title: 'New Member Joined',
          body: `${memberData.childName} has joined ${groupName}.`,
          data: {
            clubId,
            groupId,
            childId: memberData.childId,
            childName: memberData.childName,
          },
        });
      } catch (err) {
        console.error(`Failed to notify coach ${coachDoc.id}:`, err);
      }
    });

    // Notify the family
    const familyNotification = createNotification({
      userId: memberData.parentUid,
      type: 'group_joined',
      title: 'Joined Group',
      body: `${memberData.childName} has been added to ${groupName} at ${clubName}.`,
      data: {
        clubId,
        groupId,
        childId: memberData.childId,
        childName: memberData.childName,
      },
    }).catch((err) => {
      console.error(`Failed to notify family ${memberData.parentUid}:`, err);
    });

    await Promise.all([...coachNotifications, familyNotification]);
    console.log(`Notified ${coachesSnapshot.size} coaches and family about new member ${memberData.childName}`);
  }
);

/**
 * When a member is removed from a group, notify coaches and the family
 */
export const onGroupMemberDelete = onDocumentDeleted(
  'clubs/{clubId}/groups/{groupId}/members/{memberId}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const memberData = snapshot.data() as GroupMemberData;
    const { clubId, groupId } = event.params;

    const db = getFirestore();

    // Get group and club names
    const [groupDoc, clubDoc] = await Promise.all([
      db.collection('clubs').doc(clubId).collection('groups').doc(groupId).get(),
      db.collection('clubs').doc(clubId).get(),
    ]);
    const groupName = groupDoc.data()?.name || 'Unknown Group';
    const clubName = clubDoc.data()?.name || 'the club';

    // Get coaches for this club
    const coachesSnapshot = await db
      .collection('users')
      .where('role', '==', 'COACH')
      .where('clubIds', 'array-contains', clubId)
      .get();

    // Notify each coach
    const coachNotifications = coachesSnapshot.docs.map(async (coachDoc) => {
      try {
        await createNotification({
          userId: coachDoc.id,
          type: 'member_left',
          title: 'Member Removed',
          body: `${memberData.childName} has left ${groupName}.`,
          data: {
            clubId,
            groupId,
            childId: memberData.childId,
            childName: memberData.childName,
          },
        });
      } catch (err) {
        console.error(`Failed to notify coach ${coachDoc.id}:`, err);
      }
    });

    // Notify the family
    const familyNotification = createNotification({
      userId: memberData.parentUid,
      type: 'group_left',
      title: 'Left Group',
      body: `${memberData.childName} has been removed from ${groupName} at ${clubName}.`,
      data: {
        clubId,
        groupId,
        childId: memberData.childId,
        childName: memberData.childName,
      },
    }).catch((err) => {
      console.error(`Failed to notify family ${memberData.parentUid}:`, err);
    });

    await Promise.all([...coachNotifications, familyNotification]);
    console.log(`Notified ${coachesSnapshot.size} coaches and family about member removal ${memberData.childName}`);
  }
);
