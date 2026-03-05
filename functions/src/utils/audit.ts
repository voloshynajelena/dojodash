import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type { AuditAction, AuditTargetType } from '@dojodash/core';

export interface AuditInput {
  action: AuditAction;
  actorUid: string;
  actorEmail: string;
  targetType: AuditTargetType;
  targetId: string;
  clubId?: string;
  metadata?: Record<string, unknown>;
}

export async function createAuditLog(input: AuditInput): Promise<string> {
  const db = getFirestore();
  const docRef = db.collection('auditLogs').doc();

  await docRef.set({
    ...input,
    timestamp: FieldValue.serverTimestamp(),
  });

  return docRef.id;
}
