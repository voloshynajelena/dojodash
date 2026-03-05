import type { UserRole, ClubSettings } from '../models';

export interface AdminCreateClubRequest {
  name: string;
  slug: string;
  timezone: string;
  settings?: Partial<ClubSettings>;
}

export interface AdminCreateClubResponse {
  clubId: string;
}

export interface AdminCreateCoachRequest {
  email: string;
  displayName: string;
  password: string;
  clubIds: string[];
}

export interface AdminCreateCoachResponse {
  uid: string;
}

export interface AdminAssignCoachToClubsRequest {
  coachUid: string;
  clubIds: string[];
}

export interface AdminAssignCoachToClubsResponse {
  success: boolean;
}

export interface AdminSetUserDisabledRequest {
  uid: string;
  disabled: boolean;
}

export interface AdminSetUserDisabledResponse {
  success: boolean;
}

export interface AwardOrTransferMedalRequest {
  action: 'award' | 'transfer';
  templateId?: string;
  medalId?: string;
  childIds?: string[];
  fromChildId?: string;
  toChildId?: string;
  groupId: string;
  clubId: string;
  reason?: string;
}

export interface AwardOrTransferMedalResponse {
  success: boolean;
  medalIds?: string[];
}

export interface ApplyAttendanceBatchRequest {
  sessionId: string;
  clubId: string;
  groupId: string;
  records: Array<{
    childId: string;
    status: 'present' | 'absent' | 'excused' | 'late';
    notes?: string;
  }>;
  deviceId?: string;
}

export interface ApplyAttendanceBatchResponse {
  success: boolean;
  processed: number;
  errors?: string[];
}

export interface CreateInviteRequest {
  clubId: string;
  groupId: string;
  expiresInDays?: number;
  maxUses?: number;
}

export interface CreateInviteResponse {
  code: string;
  expiresAt: number;
}

export interface ClaimInviteRequest {
  code: string;
  childId: string;
}

export interface ClaimInviteResponse {
  success: boolean;
  groupId: string;
  groupName: string;
}

export interface AuthClaims {
  role: UserRole;
  clubIds: string[];
}
