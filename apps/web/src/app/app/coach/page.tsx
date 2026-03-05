'use client';

import { Title, Text, SimpleGrid, Paper, Stack } from '@mantine/core';
import { IconUsers, IconCalendar, IconMedal, IconChartBar } from '@tabler/icons-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { StatsCard } from '@dojodash/ui/components';

export default function CoachDashboard() {
  return (
    <AuthGuard allowedRoles={['ADMIN', 'COACH']}>
      <Stack gap="lg">
        <div>
          <Title order={2}>Coach Dashboard</Title>
          <Text c="dimmed">Manage your club and groups</Text>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          <StatsCard
            title="Total Members"
            value="0"
            icon={<IconUsers size={24} />}
            color="blue"
          />
          <StatsCard
            title="Sessions This Week"
            value="0"
            icon={<IconCalendar size={24} />}
            color="green"
          />
          <StatsCard
            title="Medals Awarded"
            value="0"
            subtitle="this month"
            icon={<IconMedal size={24} />}
            color="yellow"
          />
          <StatsCard
            title="Avg Attendance"
            value="0%"
            icon={<IconChartBar size={24} />}
            color="violet"
          />
        </SimpleGrid>

        <Paper p="lg" withBorder>
          <Title order={4} mb="md">Today's Sessions</Title>
          <Text c="dimmed">No sessions scheduled for today.</Text>
        </Paper>

        <Paper p="lg" withBorder>
          <Title order={4} mb="md">Recent Activity</Title>
          <Text c="dimmed">No recent activity to display.</Text>
        </Paper>
      </Stack>
    </AuthGuard>
  );
}
