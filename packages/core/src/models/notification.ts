import type { Timestamp } from './common';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationData;
  read: boolean;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

export type NotificationType =
  | 'session_reminder'
  | 'session_cancelled'
  | 'attendance_marked'
  | 'medal_awarded'
  | 'goal_progress'
  | 'goal_completed'
  | 'achievement_earned'
  | 'group_joined'
  | 'invite_received'
  | 'system';

export interface NotificationData {
  clubId?: string;
  groupId?: string;
  sessionId?: string;
  childId?: string;
  medalId?: string;
  goalId?: string;
  achievementId?: string;
  actionUrl?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sessionReminders: boolean;
  sessionCancellations: boolean;
  attendanceUpdates: boolean;
  medalAwards: boolean;
  goalUpdates: boolean;
  achievementUpdates: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email: true,
  push: true,
  sessionReminders: true,
  sessionCancellations: true,
  attendanceUpdates: true,
  medalAwards: true,
  goalUpdates: true,
  achievementUpdates: true,
};
