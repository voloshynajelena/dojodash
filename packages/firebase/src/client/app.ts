import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirebaseConfig } from './config';

let app: FirebaseApp | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (app) return app;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
    return app!;
  }

  const config = getFirebaseConfig();
  app = initializeApp(config);
  return app;
}
