# API Hooks Reference

React Query hooks for all data operations in DojoDash.

**Location**: `apps/web/src/lib/api/hooks.ts`

---

## Query Keys

Centralized cache key management for React Query:

```typescript
export const queryKeys = {
  clubs: ['clubs'] as const,
  club: (id: string) => ['clubs', id] as const,
  groups: (clubId: string) => ['groups', clubId] as const,
  groupMembers: (clubId: string, groupId: string) => ['groupMembers', clubId, groupId] as const,
  sessions: (clubId: string) => ['sessions', clubId] as const,
  children: (userId: string) => ['children', userId] as const,
  childMedals: (clubId: string, childId: string) => ['childMedals', clubId, childId] as const,
  medalTemplates: (clubId: string) => ['medalTemplates', clubId] as const,
  goals: (clubId: string) => ['goals', clubId] as const,
  leaderboard: (clubId: string, groupId?: string) => ['leaderboard', clubId, groupId] as const,
  notifications: (userId: string) => ['notifications', userId] as const,
  auditLogs: (clubId?: string) => ['auditLogs', clubId] as const,
};
```

---

## Club Hooks

### useClub
Fetch a single club by ID.

```typescript
const { data: club, isLoading } = useClub(clubId);
```

### useClubs
Fetch all clubs (admin only).

```typescript
const { data: clubs, isLoading } = useClubs();
```

### useUpdateClub
Update club settings.

```typescript
const mutation = useUpdateClub();

mutation.mutate({
  clubId: 'club123',
  data: { name: 'New Name', timezone: 'America/New_York' }
});
```

### useUploadClubLogo
Upload club logo to Firebase Storage.

```typescript
const mutation = useUploadClubLogo();

mutation.mutate({
  clubId: 'club123',
  file: imageFile
});
```

---

## Groups Hooks

### useGroups
Fetch all groups for a club.

```typescript
const { data: groups } = useGroups(clubId);
```

### useGroupMembers
Fetch members of a specific group.

```typescript
const { data: members } = useGroupMembers(clubId, groupId);
```

### useCreateGroup
Create a new group.

```typescript
const mutation = useCreateGroup();

mutation.mutate({
  clubId: 'club123',
  data: { name: 'Beginners', color: '#4ECDC4', description: 'Ages 5-7' }
});
```

### useUpdateGroup
Update group settings.

```typescript
const mutation = useUpdateGroup();

mutation.mutate({
  clubId: 'club123',
  groupId: 'group456',
  data: { name: 'Advanced Beginners' }
});
```

### useDeleteGroup
Delete a group.

```typescript
const mutation = useDeleteGroup();

mutation.mutate({ clubId: 'club123', groupId: 'group456' });
```

### useCreateInvite
Generate invite code for a group.

```typescript
const mutation = useCreateInvite();

mutation.mutate({
  clubId: 'club123',
  groupId: 'group456',
  createdBy: userId,
  expiresInDays: 7,
  maxUses: 10
});
```

---

## Sessions Hooks

### useSessions
Fetch all sessions for a club.

```typescript
const { data: sessions } = useSessions(clubId);
```

### useCreateSession
Create a new session.

```typescript
const mutation = useCreateSession();

mutation.mutate({
  clubId: 'club123',
  data: {
    title: 'Morning Training',
    groupId: 'group456',
    date: { seconds: timestamp, nanoseconds: 0 },
    startTime: { hour: 9, minute: 0 },
    endTime: { hour: 10, minute: 0 },
    status: 'scheduled'
  }
});
```

### useUpdateSession
Update session details.

```typescript
const mutation = useUpdateSession();

mutation.mutate({
  clubId: 'club123',
  sessionId: 'session789',
  data: { status: 'cancelled', notes: 'Weather conditions' }
});
```

---

## Children Hooks

### useChildren
Fetch all children for a user.

```typescript
const { data: children } = useChildren(userId);
```

### useCreateChild
Add a new child.

```typescript
const mutation = useCreateChild();

mutation.mutate({
  userId: 'user123',
  data: {
    firstName: 'Alex',
    lastName: 'Smith',
    birthDate: { seconds: timestamp, nanoseconds: 0 }
  }
});
```

---

## Medals Hooks

### useChildMedals
Fetch medals earned by a child.

```typescript
const { data: medals } = useChildMedals(clubId, childId);
```

### useMedalTemplates
Fetch available medal templates.

```typescript
const { data: templates } = useMedalTemplates(clubId);
```

### useCreateMedalTemplate
Create a new medal template.

```typescript
const mutation = useCreateMedalTemplate();

mutation.mutate({
  clubId: 'club123',
  data: {
    name: 'Star Performer',
    description: 'Outstanding effort',
    xpValue: 50,
    color: 'gold',
    category: 'achievement'
  }
});
```

### useAwardMedal
Award a medal to a child.

```typescript
const mutation = useAwardMedal();

mutation.mutate({
  clubId: 'club123',
  data: {
    templateId: 'template456',
    childId: 'child789',
    groupId: 'group123',
    awardedBy: userId,
    reason: 'Great performance today!'
  }
});
```

---

## Goals Hooks

### useGoals
Fetch goals for a club.

```typescript
const { data: goals } = useGoals(clubId);
```

### useCreateGoal
Create a new goal.

```typescript
const mutation = useCreateGoal();

mutation.mutate({
  clubId: 'club123',
  data: {
    title: 'Attend 10 sessions',
    description: 'Monthly attendance goal',
    targetValue: 10,
    type: 'attendance'
  }
});
```

---

## Leaderboard Hook

### useLeaderboard
Fetch leaderboard rankings.

```typescript
// Club-wide leaderboard
const { data: rankings } = useLeaderboard(clubId);

// Group-specific leaderboard
const { data: rankings } = useLeaderboard(clubId, groupId);
```

---

## Notifications Hook

### useNotifications
Real-time subscription to user notifications.

```typescript
const { data: notifications } = useNotifications(userId);
```

### useMarkNotificationRead
Mark a notification as read.

```typescript
const mutation = useMarkNotificationRead();

mutation.mutate({ userId: 'user123', notificationId: 'notif456' });
```

---

## Audit Logs Hook

### useAuditLogs
Fetch audit logs.

```typescript
// Global logs (admin)
const { data: logs } = useAuditLogs();

// Club-specific logs
const { data: logs } = useAuditLogs(clubId);
```

---

## Attendance Hook

### useApplyAttendanceBatch
Mark attendance for multiple children.

```typescript
const mutation = useApplyAttendanceBatch();

mutation.mutate({
  clubId: 'club123',
  sessionId: 'session456',
  attendance: [
    { childId: 'child1', status: 'present', xpAwarded: 10 },
    { childId: 'child2', status: 'absent', xpAwarded: 0 }
  ]
});
```

---

## Admin Hooks

### useAdminCreateClub
Create a new club (admin only).

```typescript
const mutation = useAdminCreateClub();

mutation.mutate({
  name: 'New Dojo',
  slug: 'new-dojo',
  color: '#FF6B6B'
});
```

### useAdminCreateCoach
Create a coach account (admin only).

```typescript
const mutation = useAdminCreateCoach();

mutation.mutate({
  email: 'coach@example.com',
  displayName: 'John Coach',
  clubIds: ['club123']
});
```

---

## Usage Patterns

### Loading States

```tsx
function GroupsList() {
  const { data: groups, isLoading, error } = useGroups(clubId);

  if (isLoading) return <Loader />;
  if (error) return <Error message={error.message} />;

  return <List items={groups} />;
}
```

### Mutations with Feedback

```tsx
function CreateGroupButton() {
  const mutation = useCreateGroup();

  const handleCreate = () => {
    mutation.mutate(
      { clubId, data: formValues },
      {
        onSuccess: () => {
          notifications.show({ message: 'Group created!', color: 'green' });
        },
        onError: (error) => {
          notifications.show({ message: error.message, color: 'red' });
        }
      }
    );
  };

  return <Button onClick={handleCreate} loading={mutation.isPending}>Create</Button>;
}
```

### Prefetching

```tsx
// Prefetch on hover
<Link
  href={`/groups/${groupId}`}
  onMouseEnter={() => queryClient.prefetchQuery({
    queryKey: queryKeys.groupMembers(clubId, groupId),
    queryFn: () => getGroupMembers(clubId, groupId)
  })}
>
  View Group
</Link>
```
