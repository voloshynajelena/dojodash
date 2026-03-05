import type { Timestamp, DayOfWeek, TimeSlot } from './common';

export interface Session {
  id: string;
  clubId: string;
  groupId: string;
  title?: string;
  date: Timestamp;
  startTime: TimeSlot;
  endTime: TimeSlot;
  status: SessionStatus;
  notes?: string;
  recurrenceId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface SessionRecurrence {
  id: string;
  clubId: string;
  groupId: string;
  dayOfWeek: DayOfWeek;
  startTime: TimeSlot;
  endTime: TimeSlot;
  startDate: Timestamp;
  endDate?: Timestamp;
  title?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SessionCancellation {
  sessionId: string;
  reason?: string;
  cancelledBy: string;
  cancelledAt: Timestamp;
  notifiedFamilies: boolean;
}
