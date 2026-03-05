# Mobile App Architecture (Future)

## Overview

This document outlines the planned architecture for a future mobile app, designed to share code with the web app through the monorepo structure.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo |
| Navigation | Expo Router |
| UI | React Native Paper or Tamagui |
| State | Zustand |
| Data | TanStack Query |
| Backend | Firebase (same as web) |

## Directory Structure

```
dojodash/
├── apps/
│   ├── web/                    # Existing Next.js app
│   └── mobile/                 # Future React Native app
│       ├── app/                # Expo Router pages
│       ├── components/         # Mobile-specific components
│       ├── hooks/              # Mobile-specific hooks
│       └── src/
│           ├── navigation/
│           └── screens/
├── packages/
│   ├── core/                   # Shared (no changes needed)
│   ├── firebase/               # Shared (may need mobile init)
│   ├── ui/                     # Web-only (Mantine)
│   └── mobile-ui/              # Future: RN components
```

## Shared Code

The following packages are already platform-agnostic:

### @dojodash/core
- All TypeScript interfaces
- Zod schemas (with react-native-zod)
- Business logic (XP, streak, leaderboard)
- Constants

### @dojodash/firebase
- DAL functions (work with both platforms)
- May need conditional emulator connection

### @dojodash/club
- All business logic
- Offline queue (already platform-agnostic)

## Mobile-Specific Features

### Offline Mode
- Enhanced offline support with local SQLite
- Background sync when connectivity returns
- Conflict resolution for attendance

### Push Notifications
- Firebase Cloud Messaging
- Local notifications for session reminders

### Coach Features
- Camera for photo capture
- Haptic feedback for quick attendance marking
- Swipe gestures for bulk actions

### Family Features
- Push notification preferences
- Achievement sharing to social media
- Calendar integration

## Authentication

### Firebase Auth
- Email/Password (shared with web)
- Apple Sign-In (iOS)
- Google Sign-In (Android/iOS)
- Biometric unlock after initial login

### App Check
- Firebase App Check with DeviceCheck (iOS)
- Firebase App Check with Play Integrity (Android)

## Implementation Phases

### Phase 1: Foundation
1. Create `apps/mobile` with Expo
2. Setup shared package imports
3. Implement auth flow
4. Basic navigation structure

### Phase 2: Family Features
1. Children list/management
2. Attendance calendar view
3. Stats dashboard
4. Notifications

### Phase 3: Coach Features
1. Club/group management
2. Session scheduling
3. Attendance marking (with offline)
4. Medal awarding

### Phase 4: Polish
1. Push notifications
2. Biometric auth
3. Performance optimization
4. App Store submission

## Package.json (Mobile)

```json
{
  "name": "@dojodash/mobile",
  "dependencies": {
    "@dojodash/core": "workspace:*",
    "@dojodash/firebase": "workspace:*",
    "@dojodash/club": "workspace:*",
    "expo": "~50.x",
    "expo-router": "~3.x",
    "firebase": "^11.x",
    "react-native": "0.73.x",
    "@tanstack/react-query": "^5.x",
    "zustand": "^4.x"
  }
}
```

## Considerations

### Metro Bundler
- May need to exclude mobile from pnpm workspaces
- Custom metro.config.js for monorepo support

### Firebase
- Use Firebase JS SDK (not React Native Firebase) for Expo Go
- Switch to native modules for production builds

### Code Sharing
- Shared hooks for data fetching
- Platform-specific UI implementations
- Feature flags for platform differences
