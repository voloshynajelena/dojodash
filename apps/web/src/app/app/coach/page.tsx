'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Title, Text, SimpleGrid, Paper, Stack, Loader, Center
} from '@mantine/core';
import { IconUsers, IconChartBar } from '@tabler/icons-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { StatsCard } from '@dojodash/ui/components';
import { useAuth } from '@/hooks/useAuth';
import { getGroups } from '@dojodash/firebase';
import type { Group as GroupType } from '@dojodash/core';

export default function CoachDashboard() {
  const { claims } = useAuth();
  const router = useRouter();
  const clubId = claims?.clubIds?.[0] || '';

  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<GroupType[]>([]);

  useEffect(() => {
    if (clubId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [clubId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const groupsData = await getGroups(clubId);
      setGroups(groupsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalMembers = () => {
    return groups.reduce((sum, g) => sum + (g.memberCount || 0), 0);
  };

  if (loading) {
    return (
      <AuthGuard allowedRoles={['ADMIN', 'COACH']}>
        <Center h={300}>
          <Loader size="lg" />
        </Center>
      </AuthGuard>
    );
  }

  if (!clubId) {
    return (
      <AuthGuard allowedRoles={['ADMIN', 'COACH']}>
        <Center h={300}>
          <Stack align="center" gap="md">
            <IconUsers size={48} color="gray" style={{ opacity: 0.5 }} />
            <Text c="dimmed" ta="center">
              You are not assigned to any club yet.<br />
              Please contact an administrator.
            </Text>
          </Stack>
        </Center>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={['ADMIN', 'COACH']}>
      <Stack gap="lg">
        <div>
          <Title order={2}>Coach Dashboard</Title>
          <Text c="dimmed">Manage your club and groups</Text>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2 }} maw={500}>
          <Paper
            p="lg"
            withBorder
            style={{ cursor: 'pointer' }}
            onClick={() => router.push('/app/coach/members')}
          >
            <StatsCard
              title="Total Members"
              value={String(getTotalMembers())}
              icon={<IconUsers size={24} />}
              color="blue"
            />
          </Paper>
          <Paper
            p="lg"
            withBorder
            style={{ cursor: 'pointer' }}
            onClick={() => router.push('/app/coach/groups')}
          >
            <StatsCard
              title="Groups"
              value={String(groups.length)}
              icon={<IconChartBar size={24} />}
              color="violet"
            />
          </Paper>
        </SimpleGrid>
      </Stack>
    </AuthGuard>
  );
}
