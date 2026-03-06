import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { createNotification } from '../utils/notifications';

interface MedalData {
  templateId: string;
  childId: string;
  clubId: string;
  groupId: string;
  name: string;
  description?: string;
  color: string;
  xpValue: number;
  awardedBy: string;
  awardedAt: FirebaseFirestore.Timestamp;
  reason?: string;
  isChampionship?: boolean;
}

/**
 * When a medal is awarded to a child, notify the family
 */
export const onMedalCreate = onDocumentCreated(
  'clubs/{clubId}/medals/{medalId}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const medalData = snapshot.data() as MedalData;
    const { clubId } = event.params;

    const db = getFirestore();

    // Find the child to get parent info
    const childrenQuery = await db
      .collectionGroup('children')
      .where('id', '==', medalData.childId)
      .limit(1)
      .get();

    if (childrenQuery.empty) {
      console.log(`Child ${medalData.childId} not found for medal notification`);
      return;
    }

    const childDoc = childrenQuery.docs[0]!;
    const childData = childDoc.data();
    const parentUid = childDoc.ref.parent.parent?.id;

    if (!parentUid) {
      console.log('Parent UID not found');
      return;
    }

    // Get club name for better notification
    const clubDoc = await db.collection('clubs').doc(clubId).get();
    const clubName = clubDoc.data()?.name || 'your club';

    const medalType = medalData.isChampionship ? 'Championship Medal' : 'Medal';
    const reasonText = medalData.reason ? `: "${medalData.reason}"` : '';

    await createNotification({
      userId: parentUid,
      type: 'medal_awarded',
      title: `${medalType} Awarded!`,
      body: `${childData.firstName} received the "${medalData.name}" medal at ${clubName}${reasonText}. +${medalData.xpValue} XP!`,
      data: {
        clubId,
        childId: medalData.childId,
        childName: childData.firstName,
        medalId: snapshot.id,
      },
    });

    console.log(`Notified family about medal "${medalData.name}" awarded to ${childData.firstName}`);
  }
);
