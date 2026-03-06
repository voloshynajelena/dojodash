import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import type { AdminDeleteUserRequest, AdminDeleteUserResponse } from '@dojodash/core';
import { requireAdmin, createAuditLog } from '../utils';

export const adminDeleteUser = onCall<AdminDeleteUserRequest, Promise<AdminDeleteUserResponse>>(
  { invoker: 'public' },
  async (request) => {
    requireAdmin(request);
    const { uid } = request.data;

    if (!uid) {
      throw new HttpsError('invalid-argument', 'uid is required');
    }

    if (uid === request.auth!.uid) {
      throw new HttpsError('failed-precondition', 'Cannot delete yourself');
    }

    const auth = getAuth();
    const db = getFirestore();

    try {
      // Get user info for audit log before deletion
      const userDoc = await db.collection('users').doc(uid).get();
      const userData = userDoc.data();

      // Delete from Firebase Auth
      await auth.deleteUser(uid);

      // Delete from Firestore
      await db.collection('users').doc(uid).delete();

      await createAuditLog({
        action: 'user.deleted',
        actorUid: request.auth!.uid,
        actorEmail: request.auth!.token.email ?? '',
        targetType: 'user',
        targetId: uid,
        metadata: { email: userData?.email, role: userData?.role },
      });

      return { success: true };
    } catch (error) {
      console.error('adminDeleteUser error:', error);
      if (error instanceof Error) {
        throw new HttpsError('internal', `Failed to delete user: ${error.message}`);
      }
      throw new HttpsError('internal', 'Failed to delete user');
    }
  }
);
