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
  // Championship medals - transferable, only one holder at a time
  isChampionship?: boolean;
  currentHolderId?: string;
  currentHolderName?: string;
  // Visual customization
  customText?: string; // Text displayed on the medal
  shape?: MedalShape;
  borderStyle?: 'solid' | 'double' | 'ribbon';
}

export type MedalCategory = 'achievement' | 'skill' | 'spirit' | 'competition' | 'special';
export type MedalShape = 'circle' | 'star' | 'shield' | 'hexagon' | 'ribbon';

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
  // Championship medals
  isChampionship?: boolean;
  customText?: string;
  shape?: MedalShape;
  borderStyle?: 'solid' | 'double' | 'ribbon';
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
