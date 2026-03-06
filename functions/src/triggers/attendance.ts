import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { calculateLevel, calculateStreakBonus } from '@dojodash/core';
import { createNotification } from '../utils';

export const onAttendanceWrite = onDocumentWritten(
  'clubs/{clubId}/sessions/{sessionId}/attendance/{childId}',
  async (event) => {
    const { clubId, sessionId, childId } = event.params;
    const afterData = event.data?.after.data();

    if (!afterData) return;

    const db = getFirestore();

    const childrenQuery = await db.collectionGroup('children').where('id', '==', childId).limit(1).get();

    if (childrenQuery.empty) return;

    const childDoc = childrenQuery.docs[0]!;
    const childData = childDoc.data();
    const parentUid = childDoc.ref.parent.parent?.id;

    if (!parentUid) return;

    const currentStats = childData.stats ?? {
      totalXP: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      totalSessions: 0,
      attendedSessions: 0,
    };

    const isPresent = afterData.status === 'present' || afterData.status === 'late';
    const xpAwarded = afterData.xpAwarded ?? 0;

    const oldLevel = currentStats.level;
    const newLevel = calculateLevel(currentStats.totalXP + xpAwarded);

    const newStats = {
      totalXP: currentStats.totalXP + xpAwarded,
      level: newLevel,
      currentStreak: isPresent ? currentStats.currentStreak + 1 : 0,
      longestStreak: isPresent
        ? Math.max(currentStats.longestStreak, currentStats.currentStreak + 1)
        : currentStats.longestStreak,
      totalSessions: currentStats.totalSessions + 1,
      attendedSessions: isPresent
        ? currentStats.attendedSessions + 1
        : currentStats.attendedSessions,
      lastAttendedAt: isPresent ? FieldValue.serverTimestamp() : currentStats.lastAttendedAt,
    };

    await childDoc.ref.update({
      stats: newStats,
      updatedAt: FieldValue.serverTimestamp(),
    });

    if (childData.privacy?.showOnLeaderboard) {
      const groupIds = childData.groupIds ?? [];
      for (const groupId of groupIds) {
        const childPublicRef = db
          .collection('clubs')
          .doc(clubId)
          .collection('childrenPublic')
          .doc(childId);

        await childPublicRef.set({
          displayName: childData.privacy?.showFullName
            ? `${childData.firstName} ${childData.lastName}`
            : childData.firstName,
          photoURL: childData.privacy?.showPhoto ? childData.photoURL : null,
          groupId,
          stats: {
            totalXP: newStats.totalXP,
            level: newStats.level,
            currentStreak: newStats.currentStreak,
          },
        }, { merge: true });
      }
    }

    // Notify about attendance
    await createNotification({
      userId: parentUid,
      type: 'attendance_marked',
      title: 'Attendance Recorded',
      body: `${childData.firstName}'s attendance has been marked as ${afterData.status}${xpAwarded > 0 ? ` (+${xpAwarded} XP)` : ''}`,
      data: { clubId, sessionId, childId },
    });

    // Notify about level up if level increased
    if (newLevel > oldLevel && isPresent) {
      await createNotification({
        userId: parentUid,
        type: 'level_up',
        title: 'Level Up!',
        body: `${childData.firstName} reached Level ${newLevel}! Total XP: ${newStats.totalXP}`,
        data: { clubId, childId, childName: childData.firstName },
      });
    }
  }
);
