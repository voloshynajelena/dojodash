# DojoDash Security Rules

## Overview

Security is enforced at multiple levels:
1. **Firebase Auth**: Custom claims for roles and club access
2. **Firestore Rules**: Collection-level access control
3. **Cloud Functions**: Business logic authorization
4. **Client Guards**: Route protection

## Custom Claims

```typescript
interface AuthClaims {
  role: 'ADMIN' | 'COACH' | 'FAMILY';
  clubIds: string[];  // For coaches only
}
```

## Firestore Rules Summary

| Collection | Read | Write |
|------------|------|-------|
| `/auditLogs` | Admin only | Server only |
| `/users/{uid}` | Self or Admin | Self or Admin |
| `/users/{uid}/children` | Self or Admin | Self or Admin |
| `/users/{uid}/notifications` | Self | Self (read field only) |
| `/clubs/{clubId}` | Authenticated | Admin or Coach with access |
| `/clubs/{clubId}/childrenPublic` | Authenticated | Server only (triggers) |
| `/clubs/{clubId}/groups` | Authenticated | Coach with club access |
| `/clubs/{clubId}/sessions` | Authenticated | Coach with club access |
| `/clubs/{clubId}/medals` | Authenticated | Server only (functions) |
| `/clubs/{clubId}/goals` | Authenticated | Coach with club access |

## Key Security Functions

### isAuthenticated()
Checks if user has valid auth token.

### isAdmin()
Checks if user has ADMIN role.

### isCoachOrAdmin()
Checks if user has ADMIN or COACH role.

### hasClubAccess(clubId)
Checks if user is ADMIN or COACH with clubId in their clubIds array.

### isOwner(uid)
Checks if the authenticated user's UID matches the resource owner.

## Storage Rules

| Path | Read | Write |
|------|------|-------|
| `/users/{uid}/profile/*` | Authenticated | Owner only |
| `/users/{uid}/children/{childId}/*` | Authenticated | Owner only |
| `/clubs/{clubId}/logo/*` | Authenticated | Coach with access |
| `/clubs/{clubId}/medals/*` | Authenticated | Coach with access |

All uploads limited to 5MB and must be images.

## Cloud Functions Authorization

Functions use `requireAuth()`, `requireAdmin()`, `requireCoachOrAdmin()`, and `requireClubAccess()` helpers:

```typescript
export const adminCreateClub = onCall(async (request) => {
  requireAdmin(request);  // Throws if not admin
  // ... function logic
});

export const applyAttendanceBatch = onCall(async (request) => {
  const { clubId } = request.data;
  requireClubAccess(request, clubId);  // Throws if no club access
  // ... function logic
});
```

## Best Practices

1. **Least Privilege**: Users only access what they need
2. **Defense in Depth**: Rules + Functions + Client guards
3. **Audit Trail**: All sensitive operations logged
4. **No Client Secrets**: All sensitive operations server-side
5. **Privacy Controls**: Families control leaderboard visibility
