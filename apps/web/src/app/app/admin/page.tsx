'use client';

import { Title, Text, SimpleGrid, Paper, Group, Stack, ThemeIcon } from '@mantine/core';
import { IconBuilding, IconUsers, IconUserShield, IconActivity } from '@tabler/icons-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { StatsCard } from '@dojodash/ui/components';

export default function AdminDashboard() {
  return (
    <AuthGuard allowedRoles={['ADMIN']}>
      <Stack gap="lg">
        <div>
          <Title order={2}>Admin Dashboard</Title>
          <Text c="dimmed">System overview and management</Text>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          <StatsCard
            title="Total Clubs"
            value="0"
            icon={<IconBuilding size={24} />}
            color="blue"
          />
          <StatsCard
            title="Active Coaches"
            value="0"
            icon={<IconUserShield size={24} />}
            color="green"
          />
          <StatsCard
            title="Families"
            value="0"
            icon={<IconUsers size={24} />}
            color="violet"
          />
          <StatsCard
            title="Active Sessions"
            value="0"
            subtitle="today"
            icon={<IconActivity size={24} />}
            color="orange"
          />
        </SimpleGrid>

        <Paper p="lg" withBorder>
          <Title order={4} mb="md">Quick Actions</Title>
          <Text c="dimmed">
            Use the sidebar to navigate to Clubs, Coaches, Users, or Audit Logs.
          </Text>
        </Paper>
      </Stack>
    </AuthGuard>
  );
}
