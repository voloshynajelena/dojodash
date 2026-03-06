import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type { AwardOrTransferMedalRequest, AwardOrTransferMedalResponse } from '@dojodash/core';
import type { MedalTemplate, Medal } from '@dojodash/core';
import { requireClubAccess, createAuditLog, createNotification } from '../utils';

export const awardOrTransferMedal = onCall<
  AwardOrTransferMedalRequest,
  Promise<AwardOrTransferMedalResponse>
>({ invoker: 'public' }, async (request) => {
  const { action, templateId, medalId, childIds, fromChildId, toChildId, groupId, clubId, reason } =
    request.data;

  requireClubAccess(request, clubId);

  const db = getFirestore();

  if (action === 'award') {
    if (!templateId || !childIds || childIds.length === 0) {
      throw new HttpsError('invalid-argument', 'templateId and childIds are required for award');
    }

    const templateDoc = await db
      .collection('clubs')
      .doc(clubId)
      .collection('medalTemplates')
      .doc(templateId)
      .get();

    if (!templateDoc.exists) {
      throw new HttpsError('not-found', 'Medal template not found');
    }

    const template = templateDoc.data() as MedalTemplate;
    const medalIds: string[] = [];
    const batch = db.batch();

    for (const childId of childIds) {
      const medalRef = db.collection('clubs').doc(clubId).collection('medals').doc();

      const medal: Omit<Medal, 'id'> = {
        templateId,
        childId,
        clubId,
        groupId,
        name: template.name,
        description: template.description,
        iconURL: template.iconURL,
        color: template.color,
        xpValue: template.xpValue,
        category: template.category,
        awardedBy: request.auth!.uid,
        awardedAt: FieldValue.serverTimestamp() as unknown as Medal['awardedAt'],
        reason,
        transferHistory: [],
      };

      batch.set(medalRef, medal);
      medalIds.push(medalRef.id);
    }

    await batch.commit();

    for (const childId of childIds) {
      const childDoc = await db.collectionGroup('children').where('id', '==', childId).limit(1).get();
      if (!childDoc.empty) {
        const parentUid = childDoc.docs[0]!.ref.parent.parent?.id;
        if (parentUid) {
          await createNotification({
            userId: parentUid,
            type: 'medal_awarded',
            title: 'Medal Awarded!',
            body: `Your child received the "${template.name}" medal!`,
            data: { clubId, groupId, medalId: medalIds[0] },
          });
        }
      }
    }

    await createAuditLog({
      action: 'medal.awarded',
      actorUid: request.auth!.uid,
      actorEmail: request.auth!.token.email ?? '',
      targetType: 'medal',
      targetId: medalIds.join(','),
      clubId,
      metadata: { templateId, childIds, reason },
    });

    return { success: true, medalIds };
  } else if (action === 'transfer') {
    if (!medalId || !fromChildId || !toChildId) {
      throw new HttpsError(
        'invalid-argument',
        'medalId, fromChildId, and toChildId are required for transfer'
      );
    }

    const medalRef = db.collection('clubs').doc(clubId).collection('medals').doc(medalId);
    const medalDoc = await medalRef.get();

    if (!medalDoc.exists) {
      throw new HttpsError('not-found', 'Medal not found');
    }

    const medal = medalDoc.data() as Medal;

    if (medal.childId !== fromChildId) {
      throw new HttpsError('failed-precondition', 'Medal does not belong to fromChildId');
    }

    const transfer = {
      fromChildId,
      toChildId,
      transferredBy: request.auth!.uid,
      transferredAt: FieldValue.serverTimestamp(),
      reason,
    };

    await medalRef.update({
      childId: toChildId,
      transferHistory: FieldValue.arrayUnion(transfer),
    });

    await createAuditLog({
      action: 'medal.transferred',
      actorUid: request.auth!.uid,
      actorEmail: request.auth!.token.email ?? '',
      targetType: 'medal',
      targetId: medalId,
      clubId,
      metadata: { fromChildId, toChildId, reason },
    });

    return { success: true };
  }

  throw new HttpsError('invalid-argument', 'Invalid action');
});
