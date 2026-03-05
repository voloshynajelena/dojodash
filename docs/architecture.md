# DojoDash Architecture

## Overview

DojoDash is a production-ready kids sports club management application built with a modern monorepo architecture.

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
├── packages/
│   ├── core/                   # Platform-agnostic domain logic
│   ├── firebase/               # Firebase client/admin, DAL
│   ├── ui/                     # Mantine theme + components
│   ├── club/                   # Club business logic
│   └── config/                 # Shared ESLint/TSConfig/Prettier
├── functions/                  # Firebase Cloud Functions
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

## Authentication Flow

1. User signs in with email/password
2. Firebase Auth issues JWT with custom claims (role, clubIds)
3. AuthGuard component checks authentication state
4. Role-based routing directs to appropriate dashboard

## Data Flow

1. **Client**: React components use hooks that call DAL functions
2. **DAL**: Data Access Layer handles Firestore operations
3. **Triggers**: Firestore triggers update derived data (stats, leaderboards)
4. **Functions**: Callable functions handle complex operations with audit logging

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
4. Client-side route guards
