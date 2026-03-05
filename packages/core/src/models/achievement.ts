import type { Timestamp } from './common';

export interface Achievement {
  id: string;
  clubId: string;
  groupId?: string;
  title: string;
  description?: string;
  iconURL?: string;
  type: AchievementType;
  criteria: AchievementCriteria;
  xpReward: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type AchievementType = 'milestone' | 'streak' | 'medal_collection' | 'attendance' | 'team';

export interface AchievementCriteria {
  type: AchievementType;
  threshold: number;
  timeframeDays?: number;
}

export interface ChildAchievement {
  id: string;
  achievementId: string;
  childId: string;
  earnedAt: Timestamp;
  xpAwarded: number;
}

export interface TeamAchievement {
  id: string;
  clubId: string;
  groupId: string;
  achievementId: string;
  earnedAt: Timestamp;
  participantChildIds: string[];
}
