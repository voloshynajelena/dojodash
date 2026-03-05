'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@dojodash/ui/components';
import type { UserRole } from '@dojodash/core/models';
import type { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, claims, loading, getRolePath } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRoles && claims && !allowedRoles.includes(claims.role)) {
      router.push(getRolePath());
    }
  }, [user, claims, loading, allowedRoles, router, pathname, getRolePath]);

  if (loading) {
    return <LoadingState message="Loading..." fullScreen />;
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && claims && !allowedRoles.includes(claims.role)) {
    return null;
  }

  return <>{children}</>;
}
