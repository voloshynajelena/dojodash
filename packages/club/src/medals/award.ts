import type { MedalTemplate, Medal, MedalCategory, Timestamp } from '@dojodash/core/models';

export interface AwardMedalOptions {
  template: MedalTemplate;
  childId: string;
  groupId: string;
  awardedBy: string;
  reason?: string;
}

export function createMedalFromTemplate(options: AwardMedalOptions): Omit<Medal, 'id'> {
  const now = new Date();
  const timestamp: Timestamp = {
    seconds: Math.floor(now.getTime() / 1000),
    nanoseconds: 0,
  };

  return {
    templateId: options.template.id,
    childId: options.childId,
    clubId: options.template.clubId,
    groupId: options.groupId,
    name: options.template.name,
    description: options.template.description,
    iconURL: options.template.iconURL,
    color: options.template.color,
    xpValue: options.template.xpValue,
    category: options.template.category,
    awardedBy: options.awardedBy,
    awardedAt: timestamp,
    reason: options.reason,
    transferHistory: [],
  };
}

export function batchCreateMedals(
  template: MedalTemplate,
  childIds: string[],
  groupId: string,
  awardedBy: string,
  reason?: string
): Omit<Medal, 'id'>[] {
  return childIds.map((childId) =>
    createMedalFromTemplate({
      template,
      childId,
      groupId,
      awardedBy,
      reason,
    })
  );
}

export function getMedalRarity(totalAwarded: number): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' {
  if (totalAwarded >= 100) return 'common';
  if (totalAwarded >= 50) return 'uncommon';
  if (totalAwarded >= 20) return 'rare';
  if (totalAwarded >= 5) return 'epic';
  return 'legendary';
}

export function getMedalRarityColor(rarity: ReturnType<typeof getMedalRarity>): string {
  switch (rarity) {
    case 'common':
      return '#9CA3AF';
    case 'uncommon':
      return '#10B981';
    case 'rare':
      return '#3B82F6';
    case 'epic':
      return '#8B5CF6';
    case 'legendary':
      return '#F59E0B';
    default:
      return '#9CA3AF';
  }
}

export function groupMedalsByCategory(medals: Medal[]): Record<MedalCategory, Medal[]> {
  const grouped: Record<MedalCategory, Medal[]> = {
    achievement: [],
    skill: [],
    spirit: [],
    competition: [],
    special: [],
  };

  for (const medal of medals) {
    grouped[medal.category].push(medal);
  }

  return grouped;
}

export function countMedalsByCategory(medals: Medal[]): Record<MedalCategory, number> {
  const counts: Record<MedalCategory, number> = {
    achievement: 0,
    skill: 0,
    spirit: 0,
    competition: 0,
    special: 0,
  };

  for (const medal of medals) {
    counts[medal.category]++;
  }

  return counts;
}
