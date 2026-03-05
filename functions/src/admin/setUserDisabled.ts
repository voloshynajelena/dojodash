import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type { AdminSetUserDisabledRequest, AdminSetUserDisabledResponse } from '@dojodash/core';
import { requireAdmin, createAuditLog } from '../utils';

export const adminSetUserDisabled = onCall<
  AdminSetUserDisabledRequest,
  Promise<AdminSetUserDisabledResponse>
>(async (request) => {
  requireAdmin(request);
  const { uid, disabled } = request.data;

  if (!uid || typeof disabled !== 'boolean') {
    throw new HttpsError('invalid-argument', 'uid and disabled (boolean) are required');
  }

  if (uid === request.auth!.uid) {
    throw new HttpsError('failed-precondition', 'Cannot disable yourself');
  }

  const auth = getAuth();
  const db = getFirestore();

  await auth.updateUser(uid, { disabled });

  await db.collection('users').doc(uid).update({
    disabled,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await createAuditLog({
    action: disabled ? 'user.disabled' : 'user.enabled',
    actorUid: request.auth!.uid,
    actorEmail: request.auth!.token.email ?? '',
    targetType: 'user',
    targetId: uid,
  });

  return { success: true };
});
