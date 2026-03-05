# DojoDash Data Model

## Collections

### /users/{uid}
User profiles and account data.

```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'ADMIN' | 'COACH' | 'FAMILY';
  clubIds: string[];
  disabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### /users/{uid}/children/{childId}
Child profiles belonging to a family.

```typescript
interface Child {
  id: string;
  parentUid: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  dateOfBirth: Timestamp;
  photoURL?: string;
  groupIds: string[];
  privacy: ChildPrivacy;
  stats: ChildStats;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### /users/{uid}/notifications/{notificationId}
User notifications.

```typescript
interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationData;
  read: boolean;
  createdAt: Timestamp;
}
```

### /clubs/{clubId}
Club entities.

```typescript
interface Club {
  id: string;
  name: string;
  slug: string;
  logoURL?: string;
  timezone: string;
  address?: ClubAddress;
  contact?: ClubContact;
  settings: ClubSettings;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### /clubs/{clubId}/groups/{groupId}
Groups within a club.

```typescript
interface Group {
  id: string;
  clubId: string;
  name: string;
  description?: string;
  color: string;
  schedule?: GroupSchedule;
  memberCount: number;
  maxMembers?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### /clubs/{clubId}/groups/{groupId}/members/{childId}
Group membership.

```typescript
interface GroupMember {
  childId: string;
  childName: string;
  parentUid: string;
  joinedAt: Timestamp;
  status: 'active' | 'inactive' | 'transferred';
}
```

### /clubs/{clubId}/sessions/{sessionId}
Training sessions.

```typescript
interface Session {
  id: string;
  clubId: string;
  groupId: string;
  title?: string;
  date: Timestamp;
  startTime: TimeSlot;
  endTime: TimeSlot;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  recurrenceId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### /clubs/{clubId}/sessions/{sessionId}/attendance/{childId}
Attendance records.

```typescript
interface Attendance {
  id: string;
  sessionId: string;
  childId: string;
  status: 'present' | 'absent' | 'excused' | 'late';
  xpAwarded: number;
  markedBy: string;
  markedAt: Timestamp;
  notes?: string;
  syncStatus: 'synced' | 'pending' | 'failed';
}
```

### /clubs/{clubId}/medals/{medalId}
Awarded medals.

```typescript
interface Medal {
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
```

### /clubs/{clubId}/childrenPublic/{childId}
Public child data for leaderboards (synced via triggers).

```typescript
interface ChildPublic {
  id: string;
  displayName: string;
  photoURL?: string;
  groupId: string;
  stats: {
    totalXP: number;
    level: number;
    currentStreak: number;
  };
}
```

### /auditLogs/{logId}
System audit logs (admin-only read, server-only write).

```typescript
interface AuditLog {
  id: string;
  action: AuditAction;
  actorUid: string;
  actorEmail: string;
  targetType: AuditTargetType;
  targetId: string;
  clubId?: string;
  metadata?: Record<string, unknown>;
  timestamp: Timestamp;
}
```

## Relationships

```
User (FAMILY)
  └── Children
        └── GroupMemberships
              └── Groups
                    └── Sessions
                          └── Attendance

User (COACH)
  └── ClubAccess
        └── Clubs
              ├── Groups
              ├── Sessions
              ├── MedalTemplates
              └── Medals

User (ADMIN)
  └── All Collections
```

## Indexes

See `firestore.indexes.json` for composite indexes required for:
- Sessions by group and date
- Medals by child and awarded date
- Goals by group and status
- Notifications by read status and creation date
- Audit logs by club and timestamp
