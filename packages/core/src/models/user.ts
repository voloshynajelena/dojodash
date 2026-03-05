import type { Timestamp } from './common';

export type UserRole = 'ADMIN' | 'COACH' | 'FAMILY';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  clubIds: string[];
  disabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Child {
  id: string;
  parentUid: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  dateOfBirth: Timestamp;
  photoURL?: string;
  groupIds: string[];
  privacy: ChildPrivacy;
  stats: ChildStats;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ChildPrivacy {
  showOnLeaderboard: boolean;
  showFullName: boolean;
  showPhoto: boolean;
}

export interface ChildStats {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  attendedSessions: number;
  lastAttendedAt?: Timestamp;
}

export interface ChildPublic {
  id: string;
  displayName: string;
  photoURL?: string;
  groupId: string;
  stats: {
    totalXP: number;
    level: number;
    currentStreak: number;
  };
}
