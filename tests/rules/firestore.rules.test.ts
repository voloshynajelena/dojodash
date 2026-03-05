import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';

let testEnv: RulesTestEnvironment;

const ADMIN_UID = 'admin-user';
const COACH_UID = 'coach-user';
const FAMILY_UID = 'family-user';
const OTHER_UID = 'other-user';
const CLUB_ID = 'test-club';

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'dojodash-test',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

function getAdminContext() {
  return testEnv.authenticatedContext(ADMIN_UID, {
    role: 'ADMIN',
    clubIds: [],
  });
}

function getCoachContext(clubIds: string[] = [CLUB_ID]) {
  return testEnv.authenticatedContext(COACH_UID, {
    role: 'COACH',
    clubIds,
  });
}

function getFamilyContext() {
  return testEnv.authenticatedContext(FAMILY_UID, {
    role: 'FAMILY',
    clubIds: [],
  });
}

function getUnauthenticatedContext() {
  return testEnv.unauthenticatedContext();
}

describe('Firestore Security Rules', () => {
  describe('Users collection', () => {
    it('allows users to read their own document', async () => {
      const db = getFamilyContext().firestore();
      const userRef = doc(db, 'users', FAMILY_UID);
      await assertSucceeds(getDoc(userRef));
    });

    it('denies users from reading other user documents', async () => {
      const db = getFamilyContext().firestore();
      const userRef = doc(db, 'users', OTHER_UID);
      await assertFails(getDoc(userRef));
    });

    it('allows admin to read any user document', async () => {
      const db = getAdminContext().firestore();
      const userRef = doc(db, 'users', FAMILY_UID);
      await assertSucceeds(getDoc(userRef));
    });

    it('denies unauthenticated access', async () => {
      const db = getUnauthenticatedContext().firestore();
      const userRef = doc(db, 'users', FAMILY_UID);
      await assertFails(getDoc(userRef));
    });
  });

  describe('Clubs collection', () => {
    it('allows authenticated users to read clubs', async () => {
      const db = getFamilyContext().firestore();
      const clubRef = doc(db, 'clubs', CLUB_ID);
      await assertSucceeds(getDoc(clubRef));
    });

    it('allows admin to create clubs', async () => {
      const db = getAdminContext().firestore();
      const clubRef = doc(db, 'clubs', 'new-club');
      await assertSucceeds(
        setDoc(clubRef, { name: 'Test Club', slug: 'test' })
      );
    });

    it('denies coach from creating clubs', async () => {
      const db = getCoachContext().firestore();
      const clubRef = doc(db, 'clubs', 'new-club');
      await assertFails(
        setDoc(clubRef, { name: 'Test Club', slug: 'test' })
      );
    });

    it('allows coach with club access to update club', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await setDoc(doc(adminDb, 'clubs', CLUB_ID), { name: 'Test Club' });
      });

      const db = getCoachContext([CLUB_ID]).firestore();
      const clubRef = doc(db, 'clubs', CLUB_ID);
      await assertSucceeds(updateDoc(clubRef, { name: 'Updated Club' }));
    });

    it('denies coach without club access from updating club', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await setDoc(doc(adminDb, 'clubs', CLUB_ID), { name: 'Test Club' });
      });

      const db = getCoachContext(['other-club']).firestore();
      const clubRef = doc(db, 'clubs', CLUB_ID);
      await assertFails(updateDoc(clubRef, { name: 'Updated Club' }));
    });
  });

  describe('Audit Logs collection', () => {
    it('allows admin to read audit logs', async () => {
      const db = getAdminContext().firestore();
      const logRef = doc(db, 'auditLogs', 'log1');
      await assertSucceeds(getDoc(logRef));
    });

    it('denies non-admin from reading audit logs', async () => {
      const db = getCoachContext().firestore();
      const logRef = doc(db, 'auditLogs', 'log1');
      await assertFails(getDoc(logRef));
    });

    it('denies all users from writing audit logs', async () => {
      const db = getAdminContext().firestore();
      const logRef = doc(db, 'auditLogs', 'log1');
      await assertFails(setDoc(logRef, { action: 'test' }));
    });
  });

  describe('Notifications subcollection', () => {
    it('allows users to mark their notifications as read', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await setDoc(
          doc(adminDb, 'users', FAMILY_UID, 'notifications', 'notif1'),
          { read: false, title: 'Test' }
        );
      });

      const db = getFamilyContext().firestore();
      const notifRef = doc(db, 'users', FAMILY_UID, 'notifications', 'notif1');
      await assertSucceeds(updateDoc(notifRef, { read: true }));
    });

    it('denies users from modifying notification content', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await setDoc(
          doc(adminDb, 'users', FAMILY_UID, 'notifications', 'notif1'),
          { read: false, title: 'Test' }
        );
      });

      const db = getFamilyContext().firestore();
      const notifRef = doc(db, 'users', FAMILY_UID, 'notifications', 'notif1');
      await assertFails(updateDoc(notifRef, { title: 'Hacked' }));
    });
  });
});
