import {
  initializeApp,
  getApps,
  cert,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

let app: App | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: Storage | undefined;

export function initAdminApp(): App {
  if (app) return app;

  const apps = getApps();
  if (apps.length > 0) {
    app = apps[0];
    return app!;
  }

  const serviceAccountKey = process.env['FIREBASE_SERVICE_ACCOUNT_KEY'];
  const projectId = process.env['FIREBASE_PROJECT_ID'] || process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'];

  if (serviceAccountKey) {
    const serviceAccount = JSON.parse(serviceAccountKey) as ServiceAccount;
    app = initializeApp({
      credential: cert(serviceAccount),
      projectId,
    });
  } else {
    app = initializeApp({ projectId });
  }

  return app;
}

export function getAdminAuth(): Auth {
  if (auth) return auth;
  initAdminApp();
  auth = getAuth();
  return auth;
}

export function getAdminFirestore(): Firestore {
  if (db) return db;
  initAdminApp();
  db = getFirestore();
  return db;
}

export function getAdminStorage(): Storage {
  if (storage) return storage;
  initAdminApp();
  storage = getStorage();
  return storage;
}
