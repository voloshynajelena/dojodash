# DojoDash

A production-ready kids sports club management application.

## Features

- **Three User Roles**: Admin, Coach, Family
- **Club Management**: Create and manage clubs and groups
- **Session Scheduling**: Recurring sessions with calendar view
- **Attendance Tracking**: Mark attendance with offline support
- **Gamification**: XP system, levels, streaks, medals, and achievements
- **Leaderboards**: Privacy-respecting group rankings
- **Notifications**: Real-time updates for families

## Tech Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Web**: Next.js 14 + TypeScript
- **UI**: Mantine v7
- **Backend**: Firebase (Auth, Firestore, Functions, Storage)
- **Testing**: Vitest + Playwright

## Quick Start

```bash
# Install dependencies
pnpm install

# Start Firebase emulators
pnpm emulators

# In another terminal, start the web app
pnpm dev

# Seed test data
pnpm seed
```

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dojodash.dev | admin123 |
| Coach | coach@dojodash.dev | coach123 |
| Family | family@dojodash.dev | family123 |

## Documentation

- [Architecture](./docs/architecture.md)
- [Data Model](./docs/data-model.md)
- [Security Rules](./docs/security-rules.md)
- [Local Development](./docs/local-dev.md)
- [Deployment](./docs/deployment.md)
- [Privacy Notes](./docs/privacy-notes.md)

## Project Structure

```
dojodash/
├── apps/web/              # Next.js web application
├── packages/
│   ├── core/              # Shared types, schemas, logic
│   ├── firebase/          # Firebase SDK and DAL
│   ├── ui/                # Mantine components
│   ├── club/              # Club business logic
│   └── config/            # Shared configs
├── functions/             # Firebase Cloud Functions
├── tests/                 # Unit and E2E tests
└── docs/                  # Documentation
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build all packages |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run E2E tests |
| `pnpm emulators` | Start Firebase emulators |
| `pnpm seed` | Seed emulator with test data |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type check all packages |

## License

Private - All rights reserved
# dojodash
