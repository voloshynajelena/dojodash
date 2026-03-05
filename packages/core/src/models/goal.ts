import type { Timestamp } from './common';

export interface Goal {
  id: string;
  clubId: string;
  groupId?: string;
  childId?: string;
  title: string;
  description?: string;
  type: GoalType;
  target: number;
  current: number;
  unit: GoalUnit;
  startDate: Timestamp;
  endDate: Timestamp;
  status: GoalStatus;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type GoalType = 'attendance' | 'xp' | 'streak' | 'medals' | 'custom';

export type GoalUnit = 'sessions' | 'points' | 'days' | 'count';

export type GoalStatus = 'active' | 'completed' | 'failed' | 'cancelled';

export interface GoalProgress {
  goalId: string;
  childId: string;
  current: number;
  percentage: number;
  updatedAt: Timestamp;
}
