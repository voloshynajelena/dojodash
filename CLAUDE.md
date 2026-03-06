# DojoDash - Claude Code Instructions

## Project Overview

DojoDash is a kids sports club management platform with three user roles:
- **Admin**: Platform administrators
- **Coach**: Club owners managing groups, sessions, attendance, rewards
- **Family**: Parents tracking their children's progress

## Tech Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Frontend**: Next.js 14 (App Router) + TypeScript
- **UI**: Mantine v7
- **Data**: TanStack Query (React Query)
- **Backend**: Firebase (Auth, Firestore, Storage, Cloud Functions v2)
- **Testing**: Vitest, Playwright

## Project Structure

```
dojodash/
├── apps/web/                 # Next.js web app
├── packages/
│   ├── core/                 # Types, schemas, business logic
│   ├── firebase/             # Firebase DAL
│   ├── ui/                   # Mantine components
│   ├── club/                 # Club business logic
│   └── config/               # Shared configs
├── functions/                # Firebase Cloud Functions
└── docs/                     # Documentation
```

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server
pnpm build            # Build all packages
pnpm emulators        # Start Firebase emulators
pnpm seed             # Seed test data

# Firebase deployment
firebase deploy --only functions    # Deploy functions
firebase deploy --only firestore    # Deploy rules
firebase deploy --only storage      # Deploy storage rules
```

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dojodash.dev | admin123 |
| Coach | coach@dojodash.dev | coach123 |
| Family | family@dojodash.dev | family123 |

## Key Files

- `apps/web/src/components/layout/AppShell.tsx` - Main navigation
- `apps/web/src/hooks/useAuth.ts` - Auth context
- `apps/web/src/lib/api/hooks.ts` - React Query hooks
- `packages/firebase/src/dal/` - Data access layer
- `functions/src/triggers/` - Firestore triggers

## Import Conventions

Always use main exports, not subpath imports:

```typescript
// Correct
import { User, Club } from '@dojodash/core';
import { getClub, getGroups } from '@dojodash/firebase';
import { StatsCard, MedalGraphic } from '@dojodash/ui/components';

// Incorrect
import { User } from '@dojodash/core/models/user';
```

## Firestore Data Model

```
/users/{userId}
  /children/{childId}
  /notifications/{notificationId}

/clubs/{clubId}
  /groups/{groupId}
    /members/{memberId}
  /sessions/{sessionId}
    /attendance/{childId}
  /medals/{medalId}
  /medalTemplates/{templateId}
```

## Cloud Functions

Functions are in `functions/src/` and need deployment when changed:

- **Admin functions**: `functions/src/admin/`
- **Coach functions**: `functions/src/coach/`
- **Triggers**: `functions/src/triggers/`

Deploy with: `firebase deploy --only functions`

## Common Tasks

### Adding a new page
1. Create `apps/web/src/app/app/[role]/[page]/page.tsx`
2. Wrap with `<AuthGuard allowedRoles={[...]}>`
3. Add to navigation in `AppShell.tsx` if needed

### Adding a notification type
1. Add type to `packages/core/src/models/notification.ts`
2. Add to constants in `packages/core/src/constants/notifications.ts`
3. Add icon in `packages/ui/src/components/NotificationItem/`
4. Create trigger in `functions/src/triggers/`

### Adding a Firebase function
1. Create in `functions/src/[category]/`
2. Export from `functions/src/[category]/index.ts`
3. Export from `functions/src/index.ts`
4. Deploy: `firebase deploy --only functions`

## Styling Guidelines

- Use Mantine components
- Colors from theme: `c="brand"`, `c="dimmed"`
- Spacing via props: `p="md"`, `gap="lg"`
- Dark mode handled automatically by Mantine

## Error Handling

- Use `notifications.show()` for user feedback
- Log errors to console for debugging
- Firestore doesn't accept `undefined` - filter with `removeUndefined()`
