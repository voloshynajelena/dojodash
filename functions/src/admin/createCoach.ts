import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type { AdminCreateCoachRequest, AdminCreateCoachResponse, AuthClaims } from '@dojodash/core';
import { requireAdmin, createAuditLog } from '../utils';

export const adminCreateCoach = onCall<AdminCreateCoachRequest, Promise<AdminCreateCoachResponse>>(
  { invoker: 'public' },
  async (request) => {
    requireAdmin(request);
    const { email, displayName, password, clubIds } = request.data;

    if (!email || !displayName || !password) {
      throw new HttpsError('invalid-argument', 'email, displayName, and password are required');
    }

    if (!clubIds || clubIds.length === 0) {
      throw new HttpsError('invalid-argument', 'At least one clubId is required');
    }

    const auth = getAuth();
    const db = getFirestore();

    try {
      const userRecord = await auth.createUser({
        email,
        displayName,
        password,
        emailVerified: false,
      });

      const claims: AuthClaims = {
        role: 'COACH',
        clubIds,
      };
      await auth.setCustomUserClaims(userRecord.uid, claims);

      await db.collection('users').doc(userRecord.uid).set({
        email,
        displayName,
        role: 'COACH',
        clubIds,
        disabled: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      await createAuditLog({
        action: 'user.created',
        actorUid: request.auth!.uid,
        actorEmail: request.auth!.token.email ?? '',
        targetType: 'user',
        targetId: userRecord.uid,
        metadata: { email, role: 'COACH', clubIds },
      });

      return { uid: userRecord.uid };
    } catch (error) {
      console.error('adminCreateCoach error:', error);
      if (error instanceof Error) {
        if (error.message.includes('email-already-exists')) {
          throw new HttpsError('already-exists', 'A user with this email already exists');
        }
        // Pass through the actual error message for debugging
        throw new HttpsError('internal', `Failed to create coach: ${error.message}`);
      }
      throw new HttpsError('internal', 'Failed to create coach: Unknown error');
    }
  }
);
