import type { Timestamp } from './common';

export interface AuditLog {
  id: string;
  action: AuditAction;
  actorUid: string;
  actorEmail: string;
  targetType: AuditTargetType;
  targetId: string;
  clubId?: string;
  metadata?: Record<string, unknown>;
  timestamp: Timestamp;
  ipAddress?: string;
  userAgent?: string;
}

export type AuditAction =
  | 'user.created'
  | 'user.updated'
  | 'user.disabled'
  | 'user.enabled'
  | 'club.created'
  | 'club.updated'
  | 'club.deleted'
  | 'group.created'
  | 'group.updated'
  | 'group.deleted'
  | 'group.member_added'
  | 'group.member_removed'
  | 'group.member_transferred'
  | 'session.created'
  | 'session.updated'
  | 'session.cancelled'
  | 'attendance.marked'
  | 'attendance.batch_submitted'
  | 'medal.template_created'
  | 'medal.awarded'
  | 'medal.transferred'
  | 'goal.created'
  | 'goal.updated'
  | 'goal.completed'
  | 'invite.created'
  | 'invite.claimed';

export type AuditTargetType =
  | 'user'
  | 'club'
  | 'group'
  | 'session'
  | 'attendance'
  | 'medal'
  | 'goal'
  | 'invite';
