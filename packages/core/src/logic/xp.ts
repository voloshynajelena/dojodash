import type { ClubSettings, ChildStats } from '../models';

export const XP_PER_LEVEL = 100;
export const MAX_LEVEL = 100;

export function calculateLevel(totalXP: number): number {
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  return Math.min(level, MAX_LEVEL);
}

export function calculateXPToNextLevel(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP);
  if (currentLevel >= MAX_LEVEL) return 0;
  const xpForCurrentLevel = (currentLevel - 1) * XP_PER_LEVEL;
  return XP_PER_LEVEL - (totalXP - xpForCurrentLevel);
}

export function calculateLevelProgress(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP);
  if (currentLevel >= MAX_LEVEL) return 100;
  const xpForCurrentLevel = (currentLevel - 1) * XP_PER_LEVEL;
  const progressXP = totalXP - xpForCurrentLevel;
  return Math.round((progressXP / XP_PER_LEVEL) * 100);
}

export function calculateSessionXP(
  settings: ClubSettings,
  isStreakBonus: boolean
): number {
  let xp = settings.xpPerSession;
  if (isStreakBonus) {
    xp += settings.streakBonusXP;
  }
  return xp;
}

export function calculateStreakBonus(currentStreak: number): boolean {
  return currentStreak >= 3;
}

export function updateStatsForAttendance(
  stats: ChildStats,
  attended: boolean,
  xpAwarded: number,
  sessionDate: Date
): ChildStats {
  const newStats = { ...stats };
  newStats.totalSessions += 1;

  if (attended) {
    newStats.attendedSessions += 1;
    newStats.totalXP += xpAwarded;
    newStats.level = calculateLevel(newStats.totalXP);
    newStats.currentStreak += 1;
    newStats.longestStreak = Math.max(newStats.longestStreak, newStats.currentStreak);
    newStats.lastAttendedAt = {
      seconds: Math.floor(sessionDate.getTime() / 1000),
      nanoseconds: 0,
    };
  } else {
    newStats.currentStreak = 0;
  }

  return newStats;
}
