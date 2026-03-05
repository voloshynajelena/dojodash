'use client';

import { Container, Title, Text, Card, SimpleGrid, Progress, Group, Stack, RingProgress } from '@mantine/core';
import { IconFlame, IconTrophy, IconTarget, IconTrendingUp } from '@tabler/icons-react';

export default function FamilyStatsPage() {
  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xs">Stats & Progress</Title>
      <Text c="dimmed" mb="xl">Track your child's achievements</Text>

      <SimpleGrid cols={{ base: 2, md: 4 }} mb="xl">
        <Card withBorder p="lg" ta="center">
          <IconTrophy size={32} color="var(--mantine-color-yellow-6)" />
          <Text size="xl" fw={700} mt="xs">150</Text>
          <Text size="sm" c="dimmed">Total XP</Text>
        </Card>

        <Card withBorder p="lg" ta="center">
          <IconTrendingUp size={32} color="var(--mantine-color-blue-6)" />
          <Text size="xl" fw={700} mt="xs">Level 2</Text>
          <Text size="sm" c="dimmed">Current Level</Text>
        </Card>

        <Card withBorder p="lg" ta="center">
          <IconFlame size={32} color="var(--mantine-color-orange-6)" />
          <Text size="xl" fw={700} mt="xs">3 Days</Text>
          <Text size="sm" c="dimmed">Current Streak</Text>
        </Card>

        <Card withBorder p="lg" ta="center">
          <IconTarget size={32} color="var(--mantine-color-green-6)" />
          <Text size="xl" fw={700} mt="xs">5 Days</Text>
          <Text size="sm" c="dimmed">Best Streak</Text>
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card withBorder p="lg">
          <Title order={4} mb="md">Level Progress</Title>
          <Group justify="center" mb="md">
            <RingProgress
              size={180}
              thickness={20}
              sections={[{ value: 75, color: 'blue' }]}
              label={
                <Stack align="center" gap={0}>
                  <Text size="xl" fw={700}>Level 2</Text>
                  <Text size="sm" c="dimmed">75%</Text>
                </Stack>
              }
            />
          </Group>
          <Group justify="space-between">
            <Text size="sm">150 XP</Text>
            <Text size="sm" c="dimmed">Next: 200 XP</Text>
          </Group>
          <Progress value={75} size="lg" mt="xs" />
        </Card>

        <Card withBorder p="lg">
          <Title order={4} mb="md">Attendance Stats</Title>
          <Stack gap="md">
            <div>
              <Group justify="space-between" mb="xs">
                <Text size="sm">Total Sessions</Text>
                <Text size="sm" fw={500}>15</Text>
              </Group>
              <Progress value={100} size="sm" />
            </div>
            <div>
              <Group justify="space-between" mb="xs">
                <Text size="sm">Attended</Text>
                <Text size="sm" fw={500} c="green">12</Text>
              </Group>
              <Progress value={80} color="green" size="sm" />
            </div>
            <div>
              <Group justify="space-between" mb="xs">
                <Text size="sm">Attendance Rate</Text>
                <Text size="sm" fw={500} c="blue">80%</Text>
              </Group>
              <Progress value={80} color="blue" size="sm" />
            </div>
          </Stack>
        </Card>
      </SimpleGrid>
    </Container>
  );
}
