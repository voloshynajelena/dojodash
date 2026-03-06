# DojoDash Setup Guide

## Prerequisites

- Node.js 20+
- pnpm 8+
- Firebase CLI (`npm install -g firebase-tools`)
- Git

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Monorepo** | pnpm workspaces + Turborepo |
| **Frontend** | Next.js 14 (App Router) + TypeScript |
| **UI Library** | Mantine v7 |
| **Forms** | Zod + @mantine/form |
| **Data Fetching** | TanStack Query (React Query) |
| **Auth** | Firebase Authentication |
| **Database** | Cloud Firestore |
| **Storage** | Firebase Storage |
| **Functions** | Firebase Cloud Functions (v2) |
| **Security** | Firebase App Check |
| **Testing** | Vitest, Playwright |

## Project Structure

```
dojodash/
├── apps/
│   └── web/                    # Next.js App Router
├── packages/
│   ├── core/                   # Platform-agnostic types & logic
│   ├── firebase/               # Firebase client SDK & DAL
│   ├── ui/                     # Mantine theme & components
│   ├── club/                   # Club business logic
│   └── config/                 # Shared ESLint/TSConfig
├── functions/                  # Firebase Cloud Functions
├── docs/                       # Documentation
├── tests/                      # E2E and integration tests
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── turbo.json
└── pnpm-workspace.yaml
```

## Installation

### 1. Clone and Install

```bash
git clone https://github.com/your-org/dojodash.git
cd dojodash
pnpm install
```

### 2. Environment Variables

Create `apps/web/.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Emulator Settings (for local development)
NEXT_PUBLIC_USE_EMULATOR=true
```

### 3. Firebase Setup

```bash
# Login to Firebase
firebase login

# Select project
firebase use your-project-id

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules

# Deploy Cloud Functions
firebase deploy --only functions
```

## Running Locally

### Start Everything

```bash
# Terminal 1: Start emulators
pnpm emulators

# Terminal 2: Seed test data (first time only)
pnpm seed

# Terminal 3: Start dev server
pnpm dev
```

### Individual Commands

```bash
# Build all packages
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e
```

## Firebase Emulator Ports

| Service | Port |
|---------|------|
| Emulator UI | 4000 |
| Auth | 9099 |
| Firestore | 8080 |
| Storage | 9199 |
| Functions | 5001 |

## Test Accounts

These accounts are created by the seed script:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | admin@dojodash.dev | admin123 | Full system access |
| Coach | coach@dojodash.dev | coach123 | Club management |
| Family | family@dojodash.dev | family123 | Child tracking |

## Troubleshooting

### Emulator Connection Issues

```bash
# Kill existing emulator processes
pkill -f "firebase emulators"

# Clear emulator data
rm -rf emulator-data/

# Restart
pnpm emulators
```

### Build Errors

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

### Type Errors

```bash
# Rebuild core package first
cd packages/core && pnpm build
cd ../.. && pnpm typecheck
```
