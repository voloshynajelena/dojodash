import { describe, it, expect } from 'vitest';
import {
  calculateLevel,
  calculateXPToNextLevel,
  calculateLevelProgress,
  calculateSessionXP,
  calculateStreakBonus,
  XP_PER_LEVEL,
} from '@dojodash/core/logic';
import type { ClubSettings } from '@dojodash/core/models';

describe('XP Calculations', () => {
  describe('calculateLevel', () => {
    it('should return level 1 for 0 XP', () => {
      expect(calculateLevel(0)).toBe(1);
    });

    it('should return level 1 for XP less than XP_PER_LEVEL', () => {
      expect(calculateLevel(50)).toBe(1);
      expect(calculateLevel(99)).toBe(1);
    });

    it('should return level 2 for XP equal to XP_PER_LEVEL', () => {
      expect(calculateLevel(XP_PER_LEVEL)).toBe(2);
    });

    it('should calculate correct level for various XP values', () => {
      expect(calculateLevel(250)).toBe(3);
      expect(calculateLevel(500)).toBe(6);
      expect(calculateLevel(1000)).toBe(11);
    });

    it('should cap at max level', () => {
      expect(calculateLevel(10000)).toBe(100);
      expect(calculateLevel(99999)).toBe(100);
    });
  });

  describe('calculateXPToNextLevel', () => {
    it('should return full XP_PER_LEVEL for 0 XP', () => {
      expect(calculateXPToNextLevel(0)).toBe(XP_PER_LEVEL);
    });

    it('should calculate remaining XP correctly', () => {
      expect(calculateXPToNextLevel(50)).toBe(50);
      expect(calculateXPToNextLevel(150)).toBe(50);
    });

    it('should return 0 at max level', () => {
      expect(calculateXPToNextLevel(10000)).toBe(0);
    });
  });

  describe('calculateLevelProgress', () => {
    it('should return 0 for 0 XP', () => {
      expect(calculateLevelProgress(0)).toBe(0);
    });

    it('should return 50 for halfway through a level', () => {
      expect(calculateLevelProgress(50)).toBe(50);
    });

    it('should return 100 at max level', () => {
      expect(calculateLevelProgress(10000)).toBe(100);
    });
  });

  describe('calculateSessionXP', () => {
    const settings: ClubSettings = {
      xpPerSession: 10,
      streakBonusXP: 5,
      defaultSessionDurationMinutes: 60,
      enableMedals: true,
      enableGoals: true,
      enableLeaderboard: true,
    };

    it('should return base XP without streak bonus', () => {
      expect(calculateSessionXP(settings, false)).toBe(10);
    });

    it('should add streak bonus XP', () => {
      expect(calculateSessionXP(settings, true)).toBe(15);
    });
  });

  describe('calculateStreakBonus', () => {
    it('should return false for streak less than 3', () => {
      expect(calculateStreakBonus(0)).toBe(false);
      expect(calculateStreakBonus(1)).toBe(false);
      expect(calculateStreakBonus(2)).toBe(false);
    });

    it('should return true for streak 3 or more', () => {
      expect(calculateStreakBonus(3)).toBe(true);
      expect(calculateStreakBonus(10)).toBe(true);
    });
  });
});
