import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type Auth,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { getFirebaseApp } from './app';
import { isEmulatorMode } from './config';

let auth: Auth | undefined;
let emulatorConnected = false;

export function getFirebaseAuth(): Auth {
  if (auth) return auth;

  const app = getFirebaseApp();
  auth = getAuth(app);

  if (isEmulatorMode() && !emulatorConnected && typeof window !== 'undefined') {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    emulatorConnected = true;
  }

  return auth;
}

export async function signIn(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth();
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const auth = getFirebaseAuth();
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  return result.user;
}

export async function logout(): Promise<void> {
  const auth = getFirebaseAuth();
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  const auth = getFirebaseAuth();
  await sendPasswordResetEmail(auth, email);
}

export function onAuthChange(callback: (user: User | null) => void): Unsubscribe {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  const auth = getFirebaseAuth();
  return auth.currentUser;
}

export async function getIdToken(): Promise<string | null> {
  const user = getCurrentUser();
  if (!user) return null;
  return user.getIdToken();
}

export async function getIdTokenClaims(): Promise<Record<string, unknown> | null> {
  const user = getCurrentUser();
  if (!user) return null;
  const result = await user.getIdTokenResult();
  return result.claims as Record<string, unknown>;
}
