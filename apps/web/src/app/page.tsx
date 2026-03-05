'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@dojodash/ui/components';

export default function HomePage() {
  const { user, loading, getRolePath } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (user) {
      router.push(getRolePath());
    } else {
      router.push('/login');
    }
  }, [user, loading, router, getRolePath]);

  return <LoadingState message="Redirecting..." fullScreen />;
}
