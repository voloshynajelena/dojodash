import { describe, it, expect } from 'vitest';
import { calculateStreak, isStreakActive, getStreakBadge } from '@dojodash/core/logic';

describe('Streak Calculations', () => {
  describe('calculateStreak', () => {
    it('should return 0 for no attendance dates', () => {
      const result = calculateStreak([]);
      expect(result.current).toBe(0);
      expect(result.longest).toBe(0);
    });

    it('should return 1 for single recent attendance', () => {
      const today = new Date();
      const result = calculateStreak([today], today);
      expect(result.current).toBe(1);
      expect(result.longest).toBe(1);
    });

    it('should calculate streak for consecutive weekly sessions', () => {
      const today = new Date();
      const dates = [
        today,
        new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
      ];
      const result = calculateStreak(dates, today);
      expect(result.current).toBe(3);
      expect(result.longest).toBe(3);
    });

    it('should reset streak after grace period', () => {
      const today = new Date();
      const oldDate = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000);
      const result = calculateStreak([oldDate], today);
      expect(result.current).toBe(0);
    });

    it('should flag at-risk streaks', () => {
      const today = new Date();
      const nearExpiry = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000);
      const result = calculateStreak([nearExpiry], today);
      expect(result.isAtRisk).toBe(true);
    });
  });

  describe('isStreakActive', () => {
    it('should return false for undefined timestamp', () => {
      expect(isStreakActive(undefined)).toBe(false);
    });

    it('should return true for recent timestamp', () => {
      const now = new Date();
      expect(
        isStreakActive({
          seconds: Math.floor(now.getTime() / 1000),
          nanoseconds: 0,
        })
      ).toBe(true);
    });

    it('should return false for old timestamp', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);
      expect(
        isStreakActive({
          seconds: Math.floor(oldDate.getTime() / 1000),
          nanoseconds: 0,
        })
      ).toBe(false);
    });
  });

  describe('getStreakBadge', () => {
    it('should return empty string for streak 0', () => {
      expect(getStreakBadge(0)).toBe('');
    });

    it('should return Streak Starter for streak 2', () => {
      expect(getStreakBadge(2)).toBe('Streak Starter');
    });

    it('should return Weekly Warrior for streak 4', () => {
      expect(getStreakBadge(4)).toBe('Weekly Warrior');
    });

    it('should return Month Marvel for streak 8', () => {
      expect(getStreakBadge(8)).toBe('Month Marvel');
    });

    it('should return Year Champion for streak 52+', () => {
      expect(getStreakBadge(52)).toBe('Year Champion');
      expect(getStreakBadge(100)).toBe('Year Champion');
    });
  });
});
