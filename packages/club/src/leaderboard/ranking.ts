import type { ChildPublic } from '@dojodash/core/models';

export interface RankedChild extends ChildPublic {
  rank: number;
  previousRank?: number;
  rankChange?: number;
}

export type RankingMetric = 'xp' | 'level' | 'streak';

export function rankChildren(
  children: ChildPublic[],
  metric: RankingMetric = 'xp'
): RankedChild[] {
  const sorted = [...children].sort((a, b) => {
    switch (metric) {
      case 'xp':
        return b.stats.totalXP - a.stats.totalXP;
      case 'level':
        return b.stats.level - a.stats.level;
      case 'streak':
        return b.stats.currentStreak - a.stats.currentStreak;
      default:
        return 0;
    }
  });

  return sorted.map((child, index) => ({
    ...child,
    rank: index + 1,
  }));
}

export function calculateRankChanges(
  current: RankedChild[],
  previous: RankedChild[]
): RankedChild[] {
  const previousRankMap = new Map<string, number>();
  for (const child of previous) {
    previousRankMap.set(child.id, child.rank);
  }

  return current.map((child) => {
    const prevRank = previousRankMap.get(child.id);
    return {
      ...child,
      previousRank: prevRank,
      rankChange: prevRank ? prevRank - child.rank : undefined,
    };
  });
}

export function getTopPerformers(
  children: ChildPublic[],
  metric: RankingMetric,
  limit: number = 3
): RankedChild[] {
  const ranked = rankChildren(children, metric);
  return ranked.slice(0, limit);
}

export function getChildRank(
  children: ChildPublic[],
  childId: string,
  metric: RankingMetric = 'xp'
): number | null {
  const ranked = rankChildren(children, metric);
  const child = ranked.find((c) => c.id === childId);
  return child?.rank ?? null;
}

export function getPercentile(rank: number, totalCount: number): number {
  if (totalCount === 0) return 0;
  return Math.round(((totalCount - rank + 1) / totalCount) * 100);
}

export function getRankBadge(rank: number): { emoji: string; label: string } | null {
  switch (rank) {
    case 1:
      return { emoji: '🥇', label: 'Gold' };
    case 2:
      return { emoji: '🥈', label: 'Silver' };
    case 3:
      return { emoji: '🥉', label: 'Bronze' };
    default:
      return null;
  }
}

export function formatRankWithSuffix(rank: number): string {
  const lastDigit = rank % 10;
  const lastTwoDigits = rank % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${rank}th`;
  }

  switch (lastDigit) {
    case 1:
      return `${rank}st`;
    case 2:
      return `${rank}nd`;
    case 3:
      return `${rank}rd`;
    default:
      return `${rank}th`;
  }
}
