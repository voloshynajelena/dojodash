'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from 'firebase/auth';
import type { UserRole } from '@dojodash/core/models';
import type { AuthClaims } from '@dojodash/core/contracts';
import {
  onAuthChange,
  signIn as firebaseSignIn,
  signUp as firebaseSignUp,
  logout as firebaseLogout,
  resetPassword as firebaseResetPassword,
  getIdTokenClaims,
} from '@dojodash/firebase/client';
import { createUser, getUser } from '@dojodash/firebase/dal';

export interface AuthState {
  user: User | null;
  claims: AuthClaims | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    claims: null,
    loading: true,
    error: null,
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        const claims = (await getIdTokenClaims()) as AuthClaims | null;
        setState({ user, claims, loading: false, error: null });
      } else {
        setState({ user: null, claims: null, loading: false, error: null });
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await firebaseSignIn(email, password);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign in failed',
      }));
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const user = await firebaseSignUp(email, password, displayName);
      await createUser({
        uid: user.uid,
        email,
        displayName,
        role: 'FAMILY',
        clubIds: [],
        disabled: false,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign up failed',
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await firebaseLogout();
      router.push('/login');
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Logout failed',
      }));
    }
  }, [router]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await firebaseResetPassword(email);
    } catch (error) {
      throw error;
    }
  }, []);

  const getRolePath = useCallback((): string => {
    if (!state.claims) return '/login';
    switch (state.claims.role) {
      case 'ADMIN':
        return '/app/admin';
      case 'COACH':
        return '/app/coach';
      case 'FAMILY':
        return '/app/family';
      default:
        return '/login';
    }
  }, [state.claims]);

  return {
    ...state,
    signIn,
    signUp,
    logout,
    resetPassword,
    getRolePath,
    isAdmin: state.claims?.role === 'ADMIN',
    isCoach: state.claims?.role === 'COACH',
    isFamily: state.claims?.role === 'FAMILY',
  };
}
