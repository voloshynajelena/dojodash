import type { NotificationType } from '../models';

export const NOTIFICATION_TITLES: Record<NotificationType, string> = {
  session_reminder: 'Upcoming Session',
  session_cancelled: 'Session Cancelled',
  attendance_marked: 'Attendance Updated',
  medal_awarded: 'Medal Awarded!',
  goal_progress: 'Goal Progress',
  goal_completed: 'Goal Completed!',
  achievement_earned: 'Achievement Unlocked!',
  group_joined: 'Joined Group',
  invite_received: 'Invitation Received',
  system: 'System Notice',
};

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  session_reminder: 'calendar',
  session_cancelled: 'calendar-x',
  attendance_marked: 'check-circle',
  medal_awarded: 'medal',
  goal_progress: 'target',
  goal_completed: 'trophy',
  achievement_earned: 'star',
  group_joined: 'users',
  invite_received: 'mail',
  system: 'info',
};

export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  session_reminder: 'blue',
  session_cancelled: 'red',
  attendance_marked: 'green',
  medal_awarded: 'yellow',
  goal_progress: 'cyan',
  goal_completed: 'green',
  achievement_earned: 'violet',
  group_joined: 'teal',
  invite_received: 'indigo',
  system: 'gray',
};
