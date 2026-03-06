# DojoDash Documentation

Documentation for the DojoDash kids sports club management platform.

## Table of Contents

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | System architecture and tech stack |
| [Setup Guide](./setup.md) | Installation and configuration |
| [Features](./features.md) | Complete feature list by role |
| [API Hooks](./api-hooks.md) | React Query hooks reference |
| [Firebase Functions](./firebase-functions.md) | Cloud Functions documentation |
| [Data Model](./data-model.md) | Firestore collections and types |
| [Security Rules](./security-rules.md) | Firestore and Storage security |
| [Local Development](./local-dev.md) | Running locally with emulators |
| [Deployment](./deployment.md) | Production deployment guide |
| [Privacy Notes](./privacy-notes.md) | Privacy implementation details |

## Quick Start

```bash
# Install dependencies
pnpm install

# Start Firebase emulators
pnpm emulators

# Seed test data
pnpm seed

# Start development server
pnpm dev
```

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dojodash.dev | admin123 |
| Coach | coach@dojodash.dev | coach123 |
| Family | family@dojodash.dev | family123 |

## URLs

- **Web App**: http://localhost:3000
- **Firebase Emulator UI**: http://localhost:4000
- **Storage Emulator**: http://localhost:9199
