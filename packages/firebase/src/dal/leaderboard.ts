import { getChildrenPublic, subscribeToChildrenPublic } from './clubs';
import type { ChildPublic } from '@dojodash/core';
import {
  buildLeaderboard,
  type LeaderboardEntry,
  type LeaderboardMetric,
} from '@dojodash/core';
import type { Unsubscribe } from '../client/firestore';

export interface LeaderboardOptions {
  clubId: string;
  groupId?: string;
  metric: LeaderboardMetric;
  limit?: number;
}

export async function getLeaderboard(options: LeaderboardOptions): Promise<LeaderboardEntry[]> {
  const children = await getChildrenPublic(options.clubId, options.groupId);
  return buildLeaderboard(children, {
    metric: options.metric,
    limit: options.limit ?? 10,
    groupId: options.groupId,
  });
}

export function subscribeToLeaderboard(
  options: LeaderboardOptions,
  callback: (entries: LeaderboardEntry[]) => void
): Unsubscribe {
  return subscribeToChildrenPublic(options.clubId, options.groupId, (children) => {
    const entries = buildLeaderboard(children, {
      metric: options.metric,
      limit: options.limit ?? 10,
      groupId: options.groupId,
    });
    callback(entries);
  });
}
