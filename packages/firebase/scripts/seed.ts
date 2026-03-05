import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

initializeApp({
  projectId: 'dojodash-dev',
});

const auth = getAuth();
const db = getFirestore();

async function createUser(
  email: string,
  password: string,
  displayName: string,
  role: 'ADMIN' | 'COACH' | 'FAMILY',
  clubIds: string[] = []
): Promise<string> {
  try {
    const existing = await auth.getUserByEmail(email);
    console.log(`User ${email} already exists`);
    return existing.uid;
  } catch {
    const user = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: true,
    });

    await auth.setCustomUserClaims(user.uid, { role, clubIds });

    await db.collection('users').doc(user.uid).set({
      email,
      displayName,
      role,
      clubIds,
      disabled: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    console.log(`Created user: ${email} (${role})`);
    return user.uid;
  }
}

async function seed() {
  console.log('Starting seed...\n');

  // Create club
  const clubRef = db.collection('clubs').doc('demo-club');
  await clubRef.set({
    name: 'Demo Dojo',
    slug: 'demo-dojo',
    timezone: 'America/New_York',
    settings: {
      xpPerSession: 10,
      streakBonusXP: 5,
      defaultSessionDurationMinutes: 60,
      enableMedals: true,
      enableGoals: true,
      enableLeaderboard: true,
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log('Created club: Demo Dojo');

  // Create users
  await createUser('admin@dojodash.dev', 'admin123', 'Admin User', 'ADMIN');
  const coachUid = await createUser('coach@dojodash.dev', 'coach123', 'Coach Smith', 'COACH', ['demo-club']);
  const familyUid = await createUser('family@dojodash.dev', 'family123', 'Parent Jones', 'FAMILY');

  // Create groups
  const group1Ref = clubRef.collection('groups').doc('beginners');
  await group1Ref.set({
    clubId: 'demo-club',
    name: 'Beginners',
    description: 'For ages 5-7',
    color: '#4ECDC4',
    memberCount: 0,
    schedule: {
      dayOfWeek: 1, // Monday
      startTime: { hour: 16, minute: 0 },
      endTime: { hour: 17, minute: 0 },
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log('Created group: Beginners');

  const group2Ref = clubRef.collection('groups').doc('advanced');
  await group2Ref.set({
    clubId: 'demo-club',
    name: 'Advanced',
    description: 'For ages 8-12',
    color: '#FF6B6B',
    memberCount: 0,
    schedule: {
      dayOfWeek: 3, // Wednesday
      startTime: { hour: 17, minute: 0 },
      endTime: { hour: 18, minute: 30 },
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log('Created group: Advanced');

  // Create child
  const childRef = db.collection('users').doc(familyUid).collection('children').doc('child1');
  await childRef.set({
    parentUid: familyUid,
    firstName: 'Jamie',
    lastName: 'Jones',
    dateOfBirth: Timestamp.fromDate(new Date('2018-05-15')),
    groupIds: ['beginners'],
    privacy: {
      showOnLeaderboard: true,
      showFullName: false,
      showPhoto: false,
    },
    stats: {
      totalXP: 150,
      level: 2,
      currentStreak: 3,
      longestStreak: 5,
      totalSessions: 15,
      attendedSessions: 12,
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log('Created child: Jamie');

  // Add to group
  await group1Ref.collection('members').doc('child1').set({
    childId: 'child1',
    childName: 'Jamie Jones',
    parentUid: familyUid,
    joinedAt: FieldValue.serverTimestamp(),
    status: 'active',
  });
  await group1Ref.update({ memberCount: 1 });

  // Create medal templates
  const starMedalRef = clubRef.collection('medalTemplates').doc('star-performer');
  await starMedalRef.set({
    clubId: 'demo-club',
    name: 'Star Performer',
    description: 'For outstanding effort in class',
    color: '#FFD700',
    xpValue: 25,
    category: 'spirit',
    isActive: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log('Created medal template: Star Performer');

  const skillMedalRef = clubRef.collection('medalTemplates').doc('skill-master');
  await skillMedalRef.set({
    clubId: 'demo-club',
    name: 'Skill Master',
    description: 'Mastered a new technique',
    color: '#3B82F6',
    xpValue: 50,
    category: 'skill',
    isActive: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log('Created medal template: Skill Master');

  // Create a session
  const today = new Date();
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));

  const sessionRef = clubRef.collection('sessions').doc('session1');
  await sessionRef.set({
    clubId: 'demo-club',
    groupId: 'beginners',
    title: 'Weekly Training',
    date: Timestamp.fromDate(nextMonday),
    startTime: { hour: 16, minute: 0 },
    endTime: { hour: 17, minute: 0 },
    status: 'scheduled',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log('Created session for next Monday');

  // Create childrenPublic entry
  await clubRef.collection('childrenPublic').doc('child1').set({
    displayName: 'Jamie',
    groupId: 'beginners',
    stats: {
      totalXP: 150,
      level: 2,
      currentStreak: 3,
    },
  });

  console.log('\n✅ Seed completed!');
  console.log('\nTest accounts:');
  console.log('  Admin:  admin@dojodash.dev / admin123');
  console.log('  Coach:  coach@dojodash.dev / coach123');
  console.log('  Family: family@dojodash.dev / family123');

  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
