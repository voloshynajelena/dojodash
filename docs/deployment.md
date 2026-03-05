# Deployment Guide

## Prerequisites

- Firebase CLI installed and authenticated
- Firebase project created
- Vercel account (for web app)

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project "dojodash-prod"
3. Enable Authentication (Email/Password)
4. Create Firestore database
5. Enable Storage
6. Enable App Check with reCAPTCHA v3

### 2. Configure Firebase

Update `.firebaserc`:
```json
{
  "projects": {
    "default": "dojodash-dev",
    "production": "dojodash-prod"
  }
}
```

### 3. Deploy Firebase Resources

```bash
# Use production project
firebase use production

# Deploy Firestore rules and indexes
firebase deploy --only firestore

# Deploy Storage rules
firebase deploy --only storage

# Deploy Cloud Functions
pnpm deploy:functions
```

## Web App Deployment (Vercel)

### 1. Connect Repository

1. Go to [Vercel](https://vercel.com)
2. Import Git repository
3. Configure:
   - Framework: Next.js
   - Root Directory: apps/web
   - Build Command: `cd ../.. && pnpm build --filter @dojodash/web`
   - Install Command: `cd ../.. && pnpm install`

### 2. Environment Variables

Set in Vercel Dashboard:
```
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=xxx
NEXT_PUBLIC_USE_EMULATORS=false
```

### 3. Deploy

Automatic deployment on push to main branch, or:
```bash
vercel --prod
```

## Create Initial Admin

After deployment, create the first admin user:

1. Sign up normally via the app
2. Use Firebase Console to set custom claims:

```javascript
// In Firebase Console > Authentication > Users
// Click user > Custom Claims
{
  "role": "ADMIN",
  "clubIds": []
}
```

Or use Firebase Admin SDK:
```typescript
await admin.auth().setCustomUserClaims(uid, {
  role: 'ADMIN',
  clubIds: [],
});
```

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install
      - run: pnpm build
      - run: pnpm test

      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
```

## Monitoring

### Firebase
- Performance Monitoring
- Crashlytics (if mobile added)
- Analytics

### Vercel
- Analytics
- Web Vitals
- Function logs

## Rollback

### Firebase Functions
```bash
firebase functions:rollback
```

### Vercel
Use Vercel dashboard to promote previous deployment.

## Security Checklist

- [ ] App Check enabled
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Environment variables secured
- [ ] CORS configured
- [ ] Rate limiting on functions
- [ ] Admin user created with proper claims
