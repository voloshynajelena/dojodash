import type { ChildPublic } from '../models';

export type LeaderboardMetric = 'xp' | 'streak' | 'level';

export interface LeaderboardEntry {
  rank: number;
  childId: string;
  displayName: string;
  photoURL?: string;
  value: number;
  change?: number;
}

export interface LeaderboardOptions {
  metric: LeaderboardMetric;
  limit: number;
  groupId?: string;
}

export function sortLeaderboard(
  children: ChildPublic[],
  metric: LeaderboardMetric
): ChildPublic[] {
  return [...children].sort((a, b) => {
    switch (metric) {
      case 'xp':
        return b.stats.totalXP - a.stats.totalXP;
      case 'streak':
        return b.stats.currentStreak - a.stats.currentStreak;
      case 'level':
        return b.stats.level - a.stats.level;
      default:
        return 0;
    }
  });
}

export function buildLeaderboard(
  children: ChildPublic[],
  options: LeaderboardOptions
): LeaderboardEntry[] {
  let filtered = children;
  if (options.groupId) {
    filtered = children.filter((c) => c.groupId === options.groupId);
  }

  const sorted = sortLeaderboard(filtered, options.metric);
  const limited = sorted.slice(0, options.limit);

  return limited.map((child, index) => ({
    rank: index + 1,
    childId: child.id,
    displayName: child.displayName,
    photoURL: child.photoURL,
    value: getMetricValue(child, options.metric),
  }));
}

function getMetricValue(child: ChildPublic, metric: LeaderboardMetric): number {
  switch (metric) {
    case 'xp':
      return child.stats.totalXP;
    case 'streak':
      return child.stats.currentStreak;
    case 'level':
      return child.stats.level;
    default:
      return 0;
  }
}

export function getRankSuffix(rank: number): string {
  const lastDigit = rank % 10;
  const lastTwoDigits = rank % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return 'th';
  }

  switch (lastDigit) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

export function formatRank(rank: number): string {
  return `${rank}${getRankSuffix(rank)}`;
}
