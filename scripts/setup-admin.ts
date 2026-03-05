/**
 * Setup script to create admin and coach users with proper custom claims
 *
 * Usage:
 *   npx tsx scripts/setup-admin.ts
 *
 * Prerequisites:
 *   1. Download service account key from Firebase Console
 *   2. Save as service-account.json in project root
 */

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load service account
const serviceAccountPath = resolve(__dirname, '../service-account.json');
let serviceAccount: ServiceAccount;

try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
} catch (error) {
  console.error('❌ Could not find service-account.json');
  console.error('   Download it from Firebase Console → Project Settings → Service accounts');
  process.exit(1);
}

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth(app);
const db = getFirestore(app);

interface UserSetup {
  email: string;
  password: string;
  displayName: string;
  role: 'ADMIN' | 'COACH' | 'FAMILY';
  clubIds?: string[];
}

const usersToCreate: UserSetup[] = [
  {
    email: 'admin@dojodash.dev',
    password: 'admin123',
    displayName: 'Admin User',
    role: 'ADMIN',
  },
  {
    email: 'coach@dojodash.dev',
    password: 'coach123',
    displayName: 'Demo Coach',
    role: 'COACH',
    clubIds: ['demo-club'],
  },
  {
    email: 'family@dojodash.dev',
    password: 'family123',
    displayName: 'Demo Family',
    role: 'FAMILY',
  },
];

async function createClub() {
  const clubRef = db.collection('clubs').doc('demo-club');
  const club = await clubRef.get();

  if (!club.exists) {
    console.log('📦 Creating demo club...');
    await clubRef.set({
      name: 'Demo Dojo',
      slug: 'demo-dojo',
      timezone: 'America/New_York',
      primaryColor: '#4ECDC4',
      settings: {
        xpPerSession: 10,
        streakBonusXP: 5,
        defaultSessionDurationMinutes: 60,
        enableMedals: true,
        enableGoals: true,
        enableLeaderboard: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✅ Demo club created');
  } else {
    console.log('📦 Demo club already exists');
  }
}

async function createUser(user: UserSetup) {
  try {
    // Check if user exists
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(user.email);
      console.log(`👤 User ${user.email} already exists`);
    } catch {
      // User doesn't exist, create them
      userRecord = await auth.createUser({
        email: user.email,
        password: user.password,
        displayName: user.displayName,
        emailVerified: true,
      });
      console.log(`✅ Created user: ${user.email}`);
    }

    // Set custom claims
    const claims: Record<string, unknown> = {
      role: user.role,
    };

    if (user.clubIds) {
      claims.clubIds = user.clubIds;
    }

    await auth.setCustomUserClaims(userRecord.uid, claims);
    console.log(`   ✅ Set role: ${user.role}${user.clubIds ? ` (clubs: ${user.clubIds.join(', ')})` : ''}`);

    // Create user document in Firestore
    const userDocRef = db.collection('users').doc(userRecord.uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      await userDocRef.set({
        uid: userRecord.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        clubIds: user.clubIds || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`   ✅ Created Firestore user document`);
    }

    return userRecord;
  } catch (error) {
    console.error(`❌ Error creating user ${user.email}:`, error);
    throw error;
  }
}

async function main() {
  console.log('\n🚀 DojoDash Setup Script\n');
  console.log('========================\n');

  // Create demo club
  await createClub();
  console.log('');

  // Create users
  for (const user of usersToCreate) {
    await createUser(user);
    console.log('');
  }

  console.log('========================');
  console.log('✅ Setup complete!\n');
  console.log('Test accounts:');
  console.log('  Admin:  admin@dojodash.dev / admin123');
  console.log('  Coach:  coach@dojodash.dev / coach123');
  console.log('  Family: family@dojodash.dev / family123');
  console.log('');

  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
