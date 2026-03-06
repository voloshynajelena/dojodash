import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getAuth } from 'firebase-admin/auth';

// Inline types to avoid workspace dependency issues in Cloud Functions
type UserRole = 'ADMIN' | 'COACH' | 'FAMILY';

interface AuthClaims {
  role: UserRole;
  clubIds: string[];
}

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  clubIds: string[];
  disabled: boolean;
}

/**
 * When a user document is created in Firestore, set the custom claims on Firebase Auth.
 * This enables role-based access control.
 */
export const onUserCreate = onDocumentCreated(
  'users/{uid}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data in snapshot');
      return;
    }

    const userData = snapshot.data() as UserData;
    const uid = event.params.uid;

    console.log(`Setting claims for user ${uid}:`, {
      role: userData.role,
      clubIds: userData.clubIds,
    });

    try {
      const auth = getAuth();
      const claims: AuthClaims = {
        role: userData.role || 'FAMILY',
        clubIds: userData.clubIds || [],
      };

      await auth.setCustomUserClaims(uid, claims);
      console.log(`Successfully set claims for user ${uid}`);
    } catch (error) {
      console.error(`Failed to set claims for user ${uid}:`, error);
      throw error;
    }
  }
);
