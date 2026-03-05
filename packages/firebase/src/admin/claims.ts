import type { UserRole, AuthClaims } from '@dojodash/core';
import { getAdminAuth } from './app';

export async function setUserClaims(
  uid: string,
  role: UserRole,
  clubIds: string[]
): Promise<void> {
  const auth = getAdminAuth();
  await auth.setCustomUserClaims(uid, { role, clubIds } satisfies AuthClaims);
}

export async function getUserClaims(uid: string): Promise<AuthClaims | null> {
  const auth = getAdminAuth();
  const user = await auth.getUser(uid);
  const claims = user.customClaims as AuthClaims | undefined;
  return claims ?? null;
}

export async function addClubToUser(uid: string, clubId: string): Promise<void> {
  const claims = await getUserClaims(uid);
  if (!claims) return;

  const clubIds = [...new Set([...claims.clubIds, clubId])];
  await setUserClaims(uid, claims.role, clubIds);
}

export async function removeClubFromUser(uid: string, clubId: string): Promise<void> {
  const claims = await getUserClaims(uid);
  if (!claims) return;

  const clubIds = claims.clubIds.filter((id) => id !== clubId);
  await setUserClaims(uid, claims.role, clubIds);
}
