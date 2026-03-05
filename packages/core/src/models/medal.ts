import type { Timestamp } from './common';

export interface MedalTemplate {
  id: string;
  clubId: string;
  name: string;
  description?: string;
  iconURL?: string;
  color: string;
  xpValue: number;
  category: MedalCategory;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type MedalCategory = 'achievement' | 'skill' | 'spirit' | 'competition' | 'special';

export interface Medal {
  id: string;
  templateId: string;
  childId: string;
  clubId: string;
  groupId: string;
  name: string;
  description?: string;
  iconURL?: string;
  color: string;
  xpValue: number;
  category: MedalCategory;
  awardedBy: string;
  awardedAt: Timestamp;
  reason?: string;
  transferHistory?: MedalTransfer[];
}

export interface MedalTransfer {
  fromChildId: string;
  toChildId: string;
  transferredBy: string;
  transferredAt: Timestamp;
  reason?: string;
}

export interface MedalAward {
  templateId: string;
  childIds: string[];
  groupId: string;
  reason?: string;
}
