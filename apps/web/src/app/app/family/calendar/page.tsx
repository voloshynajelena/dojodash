'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Center, Loader } from '@mantine/core';

export default function FamilyCalendarPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/app/family/schedule');
  }, [router]);

  return (
    <Center h="100vh">
      <Loader size="lg" />
    </Center>
  );
}
