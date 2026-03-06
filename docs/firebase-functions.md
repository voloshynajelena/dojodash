# Firebase Cloud Functions

Server-side functions for DojoDash.

**Location**: `functions/src/`

---

## Overview

DojoDash uses Firebase Cloud Functions v2 for:
- Admin operations requiring elevated privileges
- Automatic triggers on data changes
- Sending notifications to users
- Maintaining data consistency

---

## Callable Functions

### Admin Functions

Located in `functions/src/admin/`

#### adminCreateClub
Creates a new club with default settings.

```typescript
// Client usage
const result = await httpsCallable(functions, 'adminCreateClub')({
  name: 'My Dojo',
  slug: 'my-dojo',
  color: '#FF6B6B'
});
```

#### adminCreateCoach
Creates a coach user with custom claims.

```typescript
const result = await httpsCallable(functions, 'adminCreateCoach')({
  email: 'coach@example.com',
  displayName: 'John Coach',
  password: 'securePassword',
  clubIds: ['club123']
});
```

#### adminAssignCoachToClubs
Updates coach's club assignments.

```typescript
const result = await httpsCallable(functions, 'adminAssignCoachToClubs')({
  coachUid: 'coach123',
  clubIds: ['club1', 'club2']
});
```

#### adminSetUserDisabled
Enables or disables a user account.

```typescript
const result = await httpsCallable(functions, 'adminSetUserDisabled')({
  uid: 'user123',
  disabled: true
});
```

#### adminDeleteUser
Permanently deletes a user account.

```typescript
const result = await httpsCallable(functions, 'adminDeleteUser')({
  uid: 'user123'
});
```

---

### Coach Functions

Located in `functions/src/coach/`

#### awardOrTransferMedal
Awards a medal to a child, or transfers a championship medal.

```typescript
const result = await httpsCallable(functions, 'awardOrTransferMedal')({
  clubId: 'club123',
  templateId: 'template456',
  childId: 'child789',
  groupId: 'group123',
  reason: 'Great performance!'
});
```

#### applyAttendanceBatch
Records attendance for multiple children at once.

```typescript
const result = await httpsCallable(functions, 'applyAttendanceBatch')({
  clubId: 'club123',
  sessionId: 'session456',
  attendance: [
    { childId: 'child1', status: 'present', xpAwarded: 10 },
    { childId: 'child2', status: 'late', xpAwarded: 10 },
    { childId: 'child3', status: 'absent', xpAwarded: 0 }
  ]
});
```

---

### Invite Functions

#### createInvite
Generates an invite code for a group.

```typescript
const result = await httpsCallable(functions, 'createInvite')({
  clubId: 'club123',
  groupId: 'group456',
  expiresInDays: 7,
  maxUses: 10
});
// Returns: { code: 'ABC123', link: 'https://...' }
```

#### claimInvite
Family claims an invite to join a group.

```typescript
const result = await httpsCallable(functions, 'claimInvite')({
  code: 'ABC123',
  childId: 'child789'
});
```

---

## Firestore Triggers

Located in `functions/src/triggers/`

### onAttendanceWrite
Triggered when attendance is recorded.

**Actions:**
- Updates child's stats (XP, level, streak)
- Updates public leaderboard data
- Sends notification to parent
- Sends level-up notification if applicable

```typescript
// Path: clubs/{clubId}/sessions/{sessionId}/attendance/{childId}
```

### onSessionWrite
Triggered when a session is created, updated, or cancelled.

**Actions:**
- Notifies families when session is scheduled
- Notifies families when session is rescheduled
- Notifies families when session is cancelled

```typescript
// Path: clubs/{clubId}/sessions/{sessionId}
```

### onMedalCreate
Triggered when a medal is awarded.

**Actions:**
- Sends notification to parent with medal details
- Includes XP value and reason

```typescript
// Path: clubs/{clubId}/medals/{medalId}
```

### onGroupMemberCreate
Triggered when a child joins a group.

**Actions:**
- Notifies coaches about new member
- Notifies family about joining group

```typescript
// Path: clubs/{clubId}/groups/{groupId}/members/{memberId}
```

### onGroupMemberDelete
Triggered when a child leaves a group.

**Actions:**
- Notifies coaches about member leaving
- Notifies family about leaving group

```typescript
// Path: clubs/{clubId}/groups/{groupId}/members/{memberId}
```

### onChildPrivacyWrite
Triggered when privacy settings change.

**Actions:**
- Updates or removes child from public leaderboard
- Syncs privacy preferences

```typescript
// Path: users/{userId}/children/{childId}
```

### onUserCreate
Triggered when a new user signs up.

**Actions:**
- Notifies coaches about new family signup
- Creates default notification preferences

```typescript
// Path: users/{userId}
```

### onUserUpdate
Triggered when user profile changes.

**Actions:**
- Syncs display name across documents
- Logs profile changes

```typescript
// Path: users/{userId}
```

---

## Notification Types

| Type | Trigger | Recipients |
|------|---------|------------|
| `session_scheduled` | New session created | Families in group |
| `session_cancelled` | Session cancelled | Families in group |
| `attendance_marked` | Attendance recorded | Parent |
| `medal_awarded` | Medal given | Parent |
| `level_up` | Child reaches new level | Parent |
| `group_joined` | Child added to group | Parent |
| `group_left` | Child removed from group | Parent |
| `member_joined` | New member joins | Coaches |
| `member_left` | Member leaves | Coaches |

---

## Deployment

### Deploy All Functions

```bash
firebase deploy --only functions
```

### Deploy Specific Function

```bash
firebase deploy --only functions:onAttendanceWrite
```

### View Logs

```bash
firebase functions:log
```

### Local Testing

Functions run automatically with emulators:

```bash
pnpm emulators
```

---

## Environment Variables

Set secrets for production:

```bash
firebase functions:secrets:set SOME_SECRET
```

Access in functions:

```typescript
import { defineSecret } from 'firebase-functions/params';
const someSecret = defineSecret('SOME_SECRET');
```

---

## Error Handling

All callable functions return structured errors:

```typescript
throw new HttpsError('permission-denied', 'You do not have access to this club');
throw new HttpsError('not-found', 'Club not found');
throw new HttpsError('invalid-argument', 'Missing required field: name');
```

Client-side handling:

```typescript
try {
  await httpsCallable(functions, 'someFunction')(data);
} catch (error) {
  if (error.code === 'functions/permission-denied') {
    // Handle permission error
  }
}
```
