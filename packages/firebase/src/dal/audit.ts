import {
  getFirestoreDb,
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp,
} from '../client/firestore';
import type { AuditLog, AuditAction, AuditTargetType } from '@dojodash/core/models';

const AUDIT_LOGS_COLLECTION = 'auditLogs';

export interface AuditLogInput {
  action: AuditAction;
  actorUid: string;
  actorEmail: string;
  targetType: AuditTargetType;
  targetId: string;
  clubId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(input: AuditLogInput): Promise<string> {
  const db = getFirestoreDb();
  const colRef = collection(db, AUDIT_LOGS_COLLECTION);
  const docRef = doc(colRef);
  await setDoc(docRef, {
    ...input,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
}

export interface AuditLogQuery {
  clubId?: string;
  actorUid?: string;
  action?: AuditAction;
  targetType?: AuditTargetType;
  startDate?: Date;
  endDate?: Date;
  pageSize?: number;
  lastDoc?: AuditLog;
}

export async function getAuditLogs(queryParams: AuditLogQuery): Promise<AuditLog[]> {
  const db = getFirestoreDb();
  const colRef = collection(db, AUDIT_LOGS_COLLECTION);

  const constraints = [];

  if (queryParams.clubId) {
    constraints.push(where('clubId', '==', queryParams.clubId));
  }
  if (queryParams.actorUid) {
    constraints.push(where('actorUid', '==', queryParams.actorUid));
  }
  if (queryParams.action) {
    constraints.push(where('action', '==', queryParams.action));
  }
  if (queryParams.targetType) {
    constraints.push(where('targetType', '==', queryParams.targetType));
  }
  if (queryParams.startDate) {
    constraints.push(where('timestamp', '>=', Timestamp.fromDate(queryParams.startDate)));
  }
  if (queryParams.endDate) {
    constraints.push(where('timestamp', '<=', Timestamp.fromDate(queryParams.endDate)));
  }

  constraints.push(orderBy('timestamp', 'desc'));
  constraints.push(limit(queryParams.pageSize ?? 50));

  if (queryParams.lastDoc) {
    constraints.push(startAfter(queryParams.lastDoc.timestamp));
  }

  const q = query(colRef, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as AuditLog);
}

export async function getGlobalAuditLogs(pageSize = 50): Promise<AuditLog[]> {
  return getAuditLogs({ pageSize });
}

export async function getClubAuditLogs(clubId: string, pageSize = 50): Promise<AuditLog[]> {
  return getAuditLogs({ clubId, pageSize });
}

export async function getUserAuditLogs(actorUid: string, pageSize = 50): Promise<AuditLog[]> {
  return getAuditLogs({ actorUid, pageSize });
}
