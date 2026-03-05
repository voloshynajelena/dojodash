import type { Timestamp, DayOfWeek, TimeSlot } from './common';

export interface Group {
  id: string;
  clubId: string;
  name: string;
  description?: string;
  color: string;
  schedule?: GroupSchedule;
  memberCount: number;
  maxMembers?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GroupSchedule {
  dayOfWeek: DayOfWeek;
  startTime: TimeSlot;
  endTime: TimeSlot;
}

export interface GroupMember {
  childId: string;
  childName: string;
  parentUid?: string; // Optional - may not be linked yet
  joinedAt: Timestamp;
  status: GroupMemberStatus;
  // Contact info (for coach-added members)
  instagram?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export type GroupMemberStatus = 'active' | 'inactive' | 'transferred';

export interface GroupInvite {
  id: string;
  clubId: string;
  groupId: string;
  code: string;
  createdBy: string;
  expiresAt: Timestamp;
  maxUses: number;
  usedCount: number;
  createdAt: Timestamp;
}
