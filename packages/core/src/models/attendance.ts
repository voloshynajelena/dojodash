import type { Timestamp } from './common';

export interface Attendance {
  id: string;
  sessionId: string;
  childId: string;
  status: AttendanceStatus;
  xpAwarded: number;
  markedBy: string;
  markedAt: Timestamp;
  notes?: string;
  syncStatus: SyncStatus;
}

export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'late';

export type SyncStatus = 'synced' | 'pending' | 'failed';

export interface AttendanceBatch {
  sessionId: string;
  clubId: string;
  groupId: string;
  records: AttendanceRecord[];
  submittedBy: string;
  submittedAt: Timestamp;
  deviceId?: string;
}

export interface AttendanceRecord {
  childId: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceSummary {
  sessionId: string;
  total: number;
  present: number;
  absent: number;
  excused: number;
  late: number;
}
