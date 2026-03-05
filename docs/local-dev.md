# Local Development Guide

## Prerequisites

- Node.js 20+
- pnpm 9+
- Java 11+ (for Firebase Emulators)

## Initial Setup

1. Clone the repository:
```bash
git clone <repo-url>
cd dojodash
```

2. Install dependencies:
```bash
pnpm install
```

3. Copy environment file:
```bash
cp .env.example .env.local
```

4. Configure `.env.local`:
```
NEXT_PUBLIC_USE_EMULATORS=true
```

## Running Locally

### Start Everything (Recommended)

```bash
# Terminal 1: Start Firebase Emulators
pnpm emulators

# Terminal 2: Start Next.js dev server
pnpm dev
```

### Individual Commands

```bash
# Run just the web app
pnpm --filter @dojodash/web dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## Firebase Emulators

The emulator suite includes:
- Auth: http://127.0.0.1:9099
- Firestore: http://127.0.0.1:8080
- Functions: http://127.0.0.1:5001
- Storage: http://127.0.0.1:9199
- Emulator UI: http://127.0.0.1:4000

### Seed Data

```bash
pnpm seed
```

This creates test data:
- Admin user: admin@dojodash.dev (password: admin123)
- Coach user: coach@dojodash.dev (password: coach123)
- Family user: family@dojodash.dev (password: family123)
- Sample clubs, groups, sessions, and medals

### Export/Import Emulator Data

```bash
# Export current state
pnpm emulators:export

# Emulators auto-import from ./emulator-data on start
```

## Package Development

### Core Package
```bash
cd packages/core
pnpm dev        # Watch mode
pnpm test       # Run tests
```

### UI Package
```bash
cd packages/ui
pnpm dev        # Watch mode
```

### Functions
```bash
cd functions
pnpm dev        # Watch mode
pnpm serve      # Local functions with emulators
```

## Troubleshooting

### Port Conflicts
Check if ports are in use:
```bash
lsof -i :3000   # Next.js
lsof -i :4000   # Emulator UI
lsof -i :8080   # Firestore
```

### Dependency Issues
```bash
pnpm clean
pnpm install
```

### TypeScript Errors After Package Changes
```bash
pnpm build  # Rebuild all packages
```

### Emulator Connection Issues
Ensure `NEXT_PUBLIC_USE_EMULATORS=true` in `.env.local` and emulators are running before the web app.

## IDE Setup

### VS Code Extensions
- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- Tailwind CSS IntelliSense (optional)

### Recommended Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative"
}
```
