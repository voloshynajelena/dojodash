'use client';

import { Container, Title, Text, SimpleGrid, Card, Group, RingProgress, Stack } from '@mantine/core';
import { IconUsers, IconCalendar, IconTrophy, IconTrendingUp } from '@tabler/icons-react';

export default function CoachDashboardPage() {
  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xs">Dashboard</Title>
      <Text c="dimmed" mb="xl">Overview of your club</Text>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
        <Card withBorder p="lg">
          <Group>
            <IconUsers size={32} color="var(--mantine-color-blue-6)" />
            <div>
              <Text size="xl" fw={700}>1</Text>
              <Text size="sm" c="dimmed">Active Members</Text>
            </div>
          </Group>
        </Card>

        <Card withBorder p="lg">
          <Group>
            <IconCalendar size={32} color="var(--mantine-color-green-6)" />
            <div>
              <Text size="xl" fw={700}>1</Text>
              <Text size="sm" c="dimmed">Upcoming Sessions</Text>
            </div>
          </Group>
        </Card>

        <Card withBorder p="lg">
          <Group>
            <IconTrophy size={32} color="var(--mantine-color-yellow-6)" />
            <div>
              <Text size="xl" fw={700}>2</Text>
              <Text size="sm" c="dimmed">Medal Templates</Text>
            </div>
          </Group>
        </Card>

        <Card withBorder p="lg">
          <Group>
            <IconTrendingUp size={32} color="var(--mantine-color-violet-6)" />
            <div>
              <Text size="xl" fw={700}>80%</Text>
              <Text size="sm" c="dimmed">Attendance Rate</Text>
            </div>
          </Group>
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card withBorder p="lg">
          <Title order={4} mb="md">Attendance Overview</Title>
          <Group justify="center">
            <RingProgress
              size={150}
              thickness={16}
              sections={[
                { value: 80, color: 'green' },
                { value: 15, color: 'yellow' },
                { value: 5, color: 'red' },
              ]}
              label={
                <Text ta="center" size="lg" fw={700}>80%</Text>
              }
            />
          </Group>
          <Stack gap="xs" mt="md">
            <Group justify="space-between">
              <Text size="sm">Present</Text>
              <Text size="sm" fw={500}>80%</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Late</Text>
              <Text size="sm" fw={500}>15%</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Absent</Text>
              <Text size="sm" fw={500}>5%</Text>
            </Group>
          </Stack>
        </Card>

        <Card withBorder p="lg">
          <Title order={4} mb="md">Upcoming Sessions</Title>
          <Stack gap="sm">
            <Card withBorder p="sm">
              <Text fw={500}>Weekly Training</Text>
              <Text size="sm" c="dimmed">Beginners - Next Monday 4:00 PM</Text>
            </Card>
          </Stack>
        </Card>
      </SimpleGrid>
    </Container>
  );
}
