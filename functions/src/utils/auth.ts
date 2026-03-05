import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https';
import type { UserRole } from '@dojodash/core';
import type { AuthClaims } from '@dojodash/core';

export function requireAuth(request: CallableRequest): AuthClaims {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const claims = request.auth.token as unknown as AuthClaims;
  if (!claims.role) {
    throw new HttpsError('permission-denied', 'User has no role assigned');
  }

  return claims;
}

export function requireRole(request: CallableRequest, ...allowedRoles: UserRole[]): AuthClaims {
  const claims = requireAuth(request);

  if (!allowedRoles.includes(claims.role)) {
    throw new HttpsError(
      'permission-denied',
      `This action requires one of these roles: ${allowedRoles.join(', ')}`
    );
  }

  return claims;
}

export function requireAdmin(request: CallableRequest): AuthClaims {
  return requireRole(request, 'ADMIN');
}

export function requireCoachOrAdmin(request: CallableRequest): AuthClaims {
  return requireRole(request, 'ADMIN', 'COACH');
}

export function requireClubAccess(request: CallableRequest, clubId: string): AuthClaims {
  const claims = requireAuth(request);

  if (claims.role === 'ADMIN') {
    return claims;
  }

  if (claims.role === 'COACH' && claims.clubIds.includes(clubId)) {
    return claims;
  }

  throw new HttpsError('permission-denied', 'No access to this club');
}
