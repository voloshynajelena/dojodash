export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export function getFirebaseConfig(): FirebaseConfig {
  const config: FirebaseConfig = {
    apiKey: process.env['NEXT_PUBLIC_FIREBASE_API_KEY'] ?? '',
    authDomain: process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'] ?? '',
    projectId: process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] ?? '',
    storageBucket: process.env['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'] ?? '',
    messagingSenderId: process.env['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'] ?? '',
    appId: process.env['NEXT_PUBLIC_FIREBASE_APP_ID'] ?? '',
    measurementId: process.env['NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'],
  };

  const missing = Object.entries(config)
    .filter(([key, value]) => !value && key !== 'measurementId')
    .map(([key]) => key);

  if (missing.length > 0 && typeof window !== 'undefined') {
    console.warn(`Missing Firebase config: ${missing.join(', ')}`);
  }

  return config;
}

export function isEmulatorMode(): boolean {
  return process.env['NEXT_PUBLIC_USE_EMULATORS'] === 'true';
}
