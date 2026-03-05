import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';

export const onChildPrivacyWrite = onDocumentWritten(
  'users/{uid}/children/{childId}',
  async (event) => {
    const { childId } = event.params;
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (!afterData) return;

    const privacyChanged =
      beforeData?.privacy?.showOnLeaderboard !== afterData.privacy?.showOnLeaderboard ||
      beforeData?.privacy?.showFullName !== afterData.privacy?.showFullName ||
      beforeData?.privacy?.showPhoto !== afterData.privacy?.showPhoto;

    if (!privacyChanged) return;

    const db = getFirestore();
    const groupIds = afterData.groupIds ?? [];

    for (const groupId of groupIds) {
      const groupDoc = await db.collectionGroup('groups').where('id', '==', groupId).limit(1).get();
      if (groupDoc.empty) continue;

      const clubId = groupDoc.docs[0]!.ref.parent.parent?.id;
      if (!clubId) continue;

      const childPublicRef = db
        .collection('clubs')
        .doc(clubId)
        .collection('childrenPublic')
        .doc(childId);

      if (afterData.privacy?.showOnLeaderboard) {
        await childPublicRef.set({
          displayName: afterData.privacy?.showFullName
            ? `${afterData.firstName} ${afterData.lastName}`
            : afterData.firstName,
          photoURL: afterData.privacy?.showPhoto ? afterData.photoURL : null,
          groupId,
          stats: {
            totalXP: afterData.stats?.totalXP ?? 0,
            level: afterData.stats?.level ?? 1,
            currentStreak: afterData.stats?.currentStreak ?? 0,
          },
        }, { merge: true });
      } else {
        await childPublicRef.delete();
      }
    }
  }
);
