import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type { ApplyAttendanceBatchRequest, ApplyAttendanceBatchResponse } from '@dojodash/core';
import { requireClubAccess, createAuditLog } from '../utils';

export const applyAttendanceBatch = onCall<
  ApplyAttendanceBatchRequest,
  Promise<ApplyAttendanceBatchResponse>
>({ invoker: 'public' }, async (request) => {
  const { sessionId, clubId, groupId, records, deviceId } = request.data;

  if (!sessionId || !clubId || !groupId || !records || records.length === 0) {
    throw new HttpsError('invalid-argument', 'sessionId, clubId, groupId, and records are required');
  }

  requireClubAccess(request, clubId);

  const db = getFirestore();
  const batch = db.batch();
  const errors: string[] = [];
  let processed = 0;

  const clubDoc = await db.collection('clubs').doc(clubId).get();
  const clubSettings = clubDoc.data()?.settings ?? { xpPerSession: 10 };

  for (const record of records) {
    try {
      const attendanceRef = db
        .collection('clubs')
        .doc(clubId)
        .collection('sessions')
        .doc(sessionId)
        .collection('attendance')
        .doc(record.childId);

      const xpAwarded = record.status === 'present' || record.status === 'late'
        ? clubSettings.xpPerSession
        : 0;

      batch.set(attendanceRef, {
        sessionId,
        childId: record.childId,
        status: record.status,
        xpAwarded,
        markedBy: request.auth!.uid,
        markedAt: FieldValue.serverTimestamp(),
        notes: record.notes,
        syncStatus: 'synced',
      });

      processed++;
    } catch (error) {
      errors.push(`Failed to process ${record.childId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  await batch.commit();

  await createAuditLog({
    action: 'attendance.batch_submitted',
    actorUid: request.auth!.uid,
    actorEmail: request.auth!.token.email ?? '',
    targetType: 'attendance',
    targetId: sessionId,
    clubId,
    metadata: { sessionId, groupId, recordCount: records.length, deviceId },
  });

  return {
    success: errors.length === 0,
    processed,
    errors: errors.length > 0 ? errors : undefined,
  };
});
