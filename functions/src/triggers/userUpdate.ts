import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
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
 * When a user document is updated in Firestore, sync the custom claims on Firebase Auth.
 * This enables admins to change user roles from the admin panel.
 */
export const onUserUpdate = onDocumentUpdated(
  'users/{uid}',
  async (event) => {
    const before = event.data?.before.data() as UserData | undefined;
    const after = event.data?.after.data() as UserData | undefined;

    if (!before || !after) {
      console.log('No data in snapshot');
      return;
    }

    const uid = event.params.uid;

    // Check if role or clubIds changed
    const roleChanged = before.role !== after.role;
    const clubIdsChanged = JSON.stringify(before.clubIds) !== JSON.stringify(after.clubIds);

    if (!roleChanged && !clubIdsChanged) {
      // No relevant changes
      return;
    }

    console.log(`Updating claims for user ${uid}:`, {
      oldRole: before.role,
      newRole: after.role,
      oldClubIds: before.clubIds,
      newClubIds: after.clubIds,
    });

    try {
      const auth = getAuth();
      const claims: AuthClaims = {
        role: after.role || 'FAMILY',
        clubIds: after.clubIds || [],
      };

      await auth.setCustomUserClaims(uid, claims);
      console.log(`Successfully updated claims for user ${uid}`);
    } catch (error) {
      console.error(`Failed to update claims for user ${uid}:`, error);
      throw error;
    }
  }
);
