import type { Timestamp } from '../models';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const STREAK_GRACE_PERIOD_DAYS = 7;

export interface StreakInfo {
  current: number;
  longest: number;
  isAtRisk: boolean;
  daysUntilReset: number;
}

export function calculateStreak(
  attendanceDates: Date[],
  currentDate: Date = new Date()
): StreakInfo {
  if (attendanceDates.length === 0) {
    return { current: 0, longest: 0, isAtRisk: false, daysUntilReset: 0 };
  }

  const sortedDates = [...attendanceDates]
    .map((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()))
    .sort((a, b) => b.getTime() - a.getTime());

  const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const lastAttendance = sortedDates[0]!;
  const daysSinceLastAttendance = Math.floor(
    (today.getTime() - lastAttendance.getTime()) / MS_PER_DAY
  );

  let current = 0;
  let longest = 0;
  let streak = 1;

  for (let i = 0; i < sortedDates.length - 1; i++) {
    const curr = sortedDates[i]!;
    const next = sortedDates[i + 1]!;
    const daysDiff = Math.floor((curr.getTime() - next.getTime()) / MS_PER_DAY);

    if (daysDiff <= STREAK_GRACE_PERIOD_DAYS) {
      streak++;
    } else {
      longest = Math.max(longest, streak);
      streak = 1;
    }
  }
  longest = Math.max(longest, streak);

  if (daysSinceLastAttendance <= STREAK_GRACE_PERIOD_DAYS) {
    current = streak;
  }

  const isAtRisk = daysSinceLastAttendance >= STREAK_GRACE_PERIOD_DAYS - 2 && current > 0;
  const daysUntilReset = Math.max(0, STREAK_GRACE_PERIOD_DAYS - daysSinceLastAttendance);

  return { current, longest, isAtRisk, daysUntilReset };
}

export function isStreakActive(lastAttendedAt: Timestamp | undefined): boolean {
  if (!lastAttendedAt) return false;
  const lastDate = new Date(lastAttendedAt.seconds * 1000);
  const now = new Date();
  const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / MS_PER_DAY);
  return daysSince <= STREAK_GRACE_PERIOD_DAYS;
}

export function getStreakBadge(streak: number): string {
  if (streak >= 52) return 'Year Champion';
  if (streak >= 26) return 'Half-Year Hero';
  if (streak >= 12) return 'Quarter Master';
  if (streak >= 8) return 'Month Marvel';
  if (streak >= 4) return 'Weekly Warrior';
  if (streak >= 2) return 'Streak Starter';
  return '';
}
