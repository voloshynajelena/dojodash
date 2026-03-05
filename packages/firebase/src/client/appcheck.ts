import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  type AppCheck,
} from 'firebase/app-check';
import { getFirebaseApp } from './app';

let appCheck: AppCheck | undefined;

export function initAppCheck(): AppCheck | undefined {
  if (appCheck) return appCheck;

  if (typeof window === 'undefined') return undefined;

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) {
    console.warn('App Check: Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY');
    return undefined;
  }

  const app = getFirebaseApp();
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });

  return appCheck;
}

export function getAppCheck(): AppCheck | undefined {
  return appCheck;
}
