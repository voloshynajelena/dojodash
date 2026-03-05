# Privacy Implementation Notes

## Overview

DojoDash handles data for minors (children), requiring special attention to privacy. This document outlines the privacy architecture.

## Privacy Controls

### Family-Controlled Settings

Each child profile has privacy settings controlled by their parent:

```typescript
interface ChildPrivacy {
  showOnLeaderboard: boolean;  // Appear in group leaderboards
  showFullName: boolean;       // Show "John D" vs "John"
  showPhoto: boolean;          // Show profile photo on leaderboard
}
```

### Default Privacy Settings

New children are created with these defaults:
```typescript
{
  showOnLeaderboard: true,   // Opt-in to competition
  showFullName: false,       // First name only
  showPhoto: false,          // No photo sharing
}
```

## Data Visibility

### What Coaches See

Coaches can see:
- Full child names (for attendance)
- Group membership
- Attendance records
- Awarded medals
- Stats (XP, level, streak)

Coaches cannot see:
- Parent contact information
- Dates of birth
- Home addresses
- Other children not in their groups

### What Other Families See

Through leaderboards, other families see only:
- Display name (based on privacy settings)
- Photo (if enabled)
- Stats (XP, level, streak)

Other families cannot see:
- Full names (unless enabled)
- Photos (unless enabled)
- Which parent they belong to
- Attendance records

## Leaderboard Sync

The `childrenPublic` collection is managed by Firestore triggers:

1. When a child's privacy settings change, trigger fires
2. If `showOnLeaderboard` is true, sync public data
3. If false, delete from `childrenPublic`

```typescript
// Trigger: onChildPrivacyWrite
if (afterData.privacy?.showOnLeaderboard) {
  // Sync to childrenPublic with privacy-respecting fields
} else {
  // Remove from childrenPublic
}
```

## Data Retention

### Active Data
- Kept while account is active
- Families can delete children at any time
- Deletion cascades to related records

### Audit Logs
- Retained for compliance
- Do not contain PII beyond actor email
- Admin-only access

## COPPA Considerations

While not a legal opinion, DojoDash is designed with COPPA in mind:

1. **Parental Control**: Parents manage all child data
2. **Minimal Data**: Only collect necessary information
3. **No Direct Child Communication**: All notifications go to parents
4. **No Advertising**: No third-party advertising or tracking
5. **Data Portability**: Parents can export their data
6. **Deletion**: Parents can delete child profiles

## Implementation Checklist

- [x] Privacy settings on child profiles
- [x] Privacy-aware leaderboard sync
- [x] Trigger-based public data management
- [x] Role-based access control
- [x] Audit logging for sensitive operations
- [ ] Data export functionality
- [ ] Account deletion workflow
- [ ] Privacy policy page
- [ ] Parental consent flow

## Security Rules for Privacy

```javascript
// Only show children in leaderboard if privacy allows
match /clubs/{clubId}/childrenPublic/{childId} {
  allow read: if isAuthenticated();
  allow write: if false; // Server only
}
```

## Future Enhancements

1. **Data Export**: Allow parents to download all child data
2. **Deletion Request**: Formal deletion workflow with confirmation
3. **Privacy Dashboard**: Centralized privacy management
4. **Consent Logging**: Track privacy consent changes
