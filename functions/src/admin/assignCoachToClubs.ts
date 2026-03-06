import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type { AdminAssignCoachToClubsRequest, AdminAssignCoachToClubsResponse, AuthClaims } from '@dojodash/core';
import { requireAdmin, createAuditLog } from '../utils';

export const adminAssignCoachToClubs = onCall<
  AdminAssignCoachToClubsRequest,
  Promise<AdminAssignCoachToClubsResponse>
>({ invoker: 'public' }, async (request) => {
  requireAdmin(request);
  const { coachUid, clubIds } = request.data;

  if (!coachUid || !clubIds) {
    throw new HttpsError('invalid-argument', 'coachUid and clubIds are required');
  }

  const auth = getAuth();
  const db = getFirestore();

  const user = await auth.getUser(coachUid);
  const currentClaims = user.customClaims as AuthClaims | undefined;

  if (!currentClaims || currentClaims.role !== 'COACH') {
    throw new HttpsError('failed-precondition', 'User is not a coach');
  }

  const newClaims: AuthClaims = {
    role: 'COACH',
    clubIds,
  };
  await auth.setCustomUserClaims(coachUid, newClaims);

  await db.collection('users').doc(coachUid).update({
    clubIds,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await createAuditLog({
    action: 'user.updated',
    actorUid: request.auth!.uid,
    actorEmail: request.auth!.token.email ?? '',
    targetType: 'user',
    targetId: coachUid,
    metadata: { previousClubIds: currentClaims.clubIds, newClubIds: clubIds },
  });

  return { success: true };
});
