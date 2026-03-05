import { describe, it, expect } from 'vitest';
import {
  buildLeaderboard,
  sortLeaderboard,
  formatRank,
  getRankSuffix,
} from '@dojodash/core/logic';
import type { ChildPublic } from '@dojodash/core/models';

const mockChildren: ChildPublic[] = [
  {
    id: '1',
    displayName: 'Alice',
    groupId: 'group1',
    stats: { totalXP: 100, level: 2, currentStreak: 3 },
  },
  {
    id: '2',
    displayName: 'Bob',
    groupId: 'group1',
    stats: { totalXP: 200, level: 3, currentStreak: 5 },
  },
  {
    id: '3',
    displayName: 'Charlie',
    groupId: 'group2',
    stats: { totalXP: 150, level: 2, currentStreak: 1 },
  },
];

describe('Leaderboard', () => {
  describe('sortLeaderboard', () => {
    it('should sort by XP descending', () => {
      const sorted = sortLeaderboard(mockChildren, 'xp');
      expect(sorted[0]?.id).toBe('2');
      expect(sorted[1]?.id).toBe('3');
      expect(sorted[2]?.id).toBe('1');
    });

    it('should sort by streak descending', () => {
      const sorted = sortLeaderboard(mockChildren, 'streak');
      expect(sorted[0]?.id).toBe('2');
      expect(sorted[1]?.id).toBe('1');
      expect(sorted[2]?.id).toBe('3');
    });

    it('should sort by level descending', () => {
      const sorted = sortLeaderboard(mockChildren, 'level');
      expect(sorted[0]?.id).toBe('2');
    });
  });

  describe('buildLeaderboard', () => {
    it('should build leaderboard with ranks', () => {
      const leaderboard = buildLeaderboard(mockChildren, {
        metric: 'xp',
        limit: 10,
      });
      expect(leaderboard[0]?.rank).toBe(1);
      expect(leaderboard[0]?.childId).toBe('2');
      expect(leaderboard[1]?.rank).toBe(2);
    });

    it('should filter by groupId', () => {
      const leaderboard = buildLeaderboard(mockChildren, {
        metric: 'xp',
        limit: 10,
        groupId: 'group1',
      });
      expect(leaderboard.length).toBe(2);
      expect(leaderboard.every((e) => e.childId !== '3')).toBe(true);
    });

    it('should respect limit', () => {
      const leaderboard = buildLeaderboard(mockChildren, {
        metric: 'xp',
        limit: 2,
      });
      expect(leaderboard.length).toBe(2);
    });
  });

  describe('getRankSuffix', () => {
    it('should return st for 1', () => {
      expect(getRankSuffix(1)).toBe('st');
    });

    it('should return nd for 2', () => {
      expect(getRankSuffix(2)).toBe('nd');
    });

    it('should return rd for 3', () => {
      expect(getRankSuffix(3)).toBe('rd');
    });

    it('should return th for 4-10', () => {
      expect(getRankSuffix(4)).toBe('th');
      expect(getRankSuffix(10)).toBe('th');
    });

    it('should return th for 11-13', () => {
      expect(getRankSuffix(11)).toBe('th');
      expect(getRankSuffix(12)).toBe('th');
      expect(getRankSuffix(13)).toBe('th');
    });

    it('should handle 21st, 22nd, 23rd', () => {
      expect(getRankSuffix(21)).toBe('st');
      expect(getRankSuffix(22)).toBe('nd');
      expect(getRankSuffix(23)).toBe('rd');
    });
  });

  describe('formatRank', () => {
    it('should format rank with suffix', () => {
      expect(formatRank(1)).toBe('1st');
      expect(formatRank(2)).toBe('2nd');
      expect(formatRank(3)).toBe('3rd');
      expect(formatRank(11)).toBe('11th');
      expect(formatRank(21)).toBe('21st');
    });
  });
});
