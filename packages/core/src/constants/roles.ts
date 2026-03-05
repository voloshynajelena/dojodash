import type { UserRole } from '../models';

export const ROLES: Record<UserRole, UserRole> = {
  ADMIN: 'ADMIN',
  COACH: 'COACH',
  FAMILY: 'FAMILY',
} as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  COACH: 'Coach',
  FAMILY: 'Family',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  ADMIN: 'Full system access. Can manage clubs, coaches, and all users.',
  COACH: 'Manages assigned clubs. Can create groups, sessions, award medals.',
  FAMILY: 'Manages children. Views attendance, stats, medals, and notifications.',
};

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 3,
  COACH: 2,
  FAMILY: 1,
};

export function canAccessRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
