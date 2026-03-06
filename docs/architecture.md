# DojoDash Architecture

## Overview

DojoDash is a production-ready kids sports club management application built with a modern monorepo architecture.

```
┌─────────────────────────────────────────────────────────────┐
│                        Web App (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│  @dojodash/ui    │  @dojodash/firebase  │  @dojodash/club   │
├─────────────────────────────────────────────────────────────┤
│                      @dojodash/core                          │
├─────────────────────────────────────────────────────────────┤
│                    Firebase Services                         │
│  Auth  │  Firestore  │  Storage  │  Functions  │  App Check │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Monorepo | pnpm workspaces + Turborepo |
| Web | Next.js 14 App Router + TypeScript |
| UI | Mantine v7 (Light/Dark theme) |
| Forms | Zod + @mantine/form |
| Data Fetching | TanStack Query |
| Backend | Firebase (Auth, Firestore, Storage, Functions) |
| Security | Firebase App Check (reCAPTCHA v3) |
| Testing | Vitest + Playwright |

## Directory Structure

```
dojodash/
├── apps/
│   └── web/                    # Next.js App Router
│       └── src/
│           ├── app/            # Routes
│           ├── components/     # App components
│           ├── hooks/          # Custom hooks
│           └── lib/api/        # React Query hooks
├── packages/
│   ├── core/                   # Platform-agnostic domain logic
│   ├── firebase/               # Firebase client/admin, DAL
│   ├── ui/                     # Mantine theme + components
│   ├── club/                   # Club business logic
│   └── config/                 # Shared ESLint/TSConfig/Prettier
├── functions/                  # Firebase Cloud Functions
│   └── src/
│       ├── admin/              # Admin callable functions
│       ├── coach/              # Coach callable functions
│       ├── triggers/           # Firestore triggers
│       └── utils/              # Shared utilities
├── tests/                      # E2E and integration tests
└── docs/                       # Documentation
```

## Packages

### @dojodash/core
Platform-agnostic domain logic:
- TypeScript interfaces for all entities
- Zod validation schemas
- Business logic (XP, streak, leaderboard calculations)
- Cloud Function DTOs
- Constants (roles, notification types)

### @dojodash/firebase
Firebase integration:
- Client SDK initialization with emulator support
- Admin SDK for server-side operations
- Data Access Layer (DAL) for all collections
- Real-time subscriptions
- Utility functions for timestamp conversion

### @dojodash/ui
Shared UI components:
- Mantine theme configuration
- ThemeProvider with notifications
- Reusable components (MedalCard, Calendar, StatsCard, etc.)

### @dojodash/club
Club-specific business logic:
- Session recurrence generation
- Offline attendance queue with sync
- Medal awarding logic
- Leaderboard ranking

## Web App Routes

### Public Routes
| Route | Purpose |
|-------|---------|
| `/login` | Authentication |
| `/join` | Claim invite code |

### Admin Routes (`/app/admin/`)
| Route | Purpose |
|-------|---------|
| `/` | System overview |
| `/clubs` | Manage all clubs |
| `/coaches` | Manage coach accounts |
| `/users` | View all users |
| `/logs` | Global audit logs |

### Coach Routes (`/app/coach/`)
| Route | Purpose |
|-------|---------|
| `/` | Dashboard with stats |
| `/club` | Club settings, logo |
| `/groups` | Manage training groups |
| `/members` | View all members |
| `/schedule` | Session management |
| `/rewards` | Medal templates |
| `/notifications` | Coach notifications |

### Family Routes (`/app/family/`)
| Route | Purpose |
|-------|---------|
| `/` | Children with tabs (Overview/Stats/Medals) |
| `/schedule` | View upcoming sessions |
| `/notifications` | Family notifications |

## Authentication Flow

1. User signs in with email/password
2. Firebase Auth issues JWT with custom claims (`role`, `clubIds`)
3. AuthGuard component checks authentication state
4. Role-based routing directs to appropriate dashboard

## Data Flow

### Reading Data
```
Component → useQuery Hook → DAL Function → Firestore → Response
```

### Writing Data
```
Component → useMutation Hook → DAL Function → Firestore
                                    ↓
                              Cloud Trigger
                                    ↓
                         Update Related Data
                                    ↓
                          Send Notifications
```

### Real-time Updates
```
Component → onSnapshot Subscription → Firestore → Live Updates
```

## Security Model

| Role | Permissions |
|------|-------------|
| ADMIN | Full system access, create clubs/coaches |
| COACH | Manage assigned clubs, attendance, medals |
| FAMILY | Manage children, view stats, claim invites |

Security is enforced at multiple levels:
1. Firebase Auth custom claims
2. Firestore security rules
3. Cloud Function authorization checks
4. Client-side route guards (AuthGuard)

## Notification System

Automatic notifications via Cloud Functions:

| Event | Notification | Recipients |
|-------|--------------|------------|
| Session scheduled | New session alert | Families in group |
| Session cancelled | Cancellation notice | Families in group |
| Attendance marked | XP awarded update | Parent |
| Medal awarded | Achievement alert | Parent |
| Level up | Level increase | Parent |
| Member joined | New member notice | Coaches |
| Member left | Removal notice | Coaches |

## Build Pipeline

Turborepo handles the build order:

1. `@dojodash/config` (no deps)
2. `@dojodash/core` (no deps)
3. `@dojodash/firebase` (depends on core)
4. `@dojodash/ui` (depends on core)
5. `@dojodash/club` (depends on core, firebase)
6. `@dojodash/web` (depends on all)
