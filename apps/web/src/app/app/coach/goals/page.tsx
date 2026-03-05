'use client';

import { Container, Title, Text, Card, Button, Group, Progress, SimpleGrid, Badge } from '@mantine/core';
import { IconPlus, IconTarget } from '@tabler/icons-react';

export default function CoachGoalsPage() {
  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Goals</Title>
          <Text c="dimmed">Set and track group goals</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />}>Create Goal</Button>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card withBorder p="lg">
          <Group justify="space-between" mb="sm">
            <Group>
              <IconTarget size={24} color="var(--mantine-color-blue-6)" />
              <div>
                <Text fw={500}>Monthly Attendance</Text>
                <Text size="sm" c="dimmed">Beginners</Text>
              </div>
            </Group>
            <Badge color="blue">Active</Badge>
          </Group>
          <Text size="sm" mb="xs">Achieve 90% attendance this month</Text>
          <Progress value={75} size="lg" mb="xs" />
          <Group justify="space-between">
            <Text size="sm" c="dimmed">75% complete</Text>
            <Text size="sm" c="dimmed">Target: 90%</Text>
          </Group>
        </Card>

        <Card withBorder p="lg">
          <Group justify="space-between" mb="sm">
            <Group>
              <IconTarget size={24} color="var(--mantine-color-green-6)" />
              <div>
                <Text fw={500}>Team XP Goal</Text>
                <Text size="sm" c="dimmed">All Groups</Text>
              </div>
            </Group>
            <Badge color="green">Active</Badge>
          </Group>
          <Text size="sm" mb="xs">Earn 500 XP as a team</Text>
          <Progress value={30} size="lg" mb="xs" color="green" />
          <Group justify="space-between">
            <Text size="sm" c="dimmed">150 / 500 XP</Text>
            <Text size="sm" c="dimmed">30%</Text>
          </Group>
        </Card>
      </SimpleGrid>
    </Container>
  );
}
