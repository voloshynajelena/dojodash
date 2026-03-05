import type { Timestamp, GeoPoint } from './common';

export interface Club {
  id: string;
  name: string;
  slug: string;
  logoURL?: string;
  primaryColor?: string;
  timezone: string;
  address?: ClubAddress;
  contact?: ClubContact;
  settings: ClubSettings;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ClubAddress {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  location?: GeoPoint;
}

export interface ClubContact {
  email?: string;
  phone?: string;
  website?: string;
}

export interface ClubSettings {
  xpPerSession: number;
  streakBonusXP: number;
  defaultSessionDurationMinutes: number;
  enableMedals: boolean;
  enableGoals: boolean;
  enableLeaderboard: boolean;
}

export const DEFAULT_CLUB_SETTINGS: ClubSettings = {
  xpPerSession: 10,
  streakBonusXP: 5,
  defaultSessionDurationMinutes: 60,
  enableMedals: true,
  enableGoals: true,
  enableLeaderboard: true,
};
