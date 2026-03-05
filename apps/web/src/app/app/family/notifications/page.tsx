'use client';

import { Container, Title, Text, Card, Stack, Group, Badge, Button, ActionIcon } from '@mantine/core';
import { IconBell, IconCheck, IconCalendar, IconTrophy } from '@tabler/icons-react';

export default function FamilyNotificationsPage() {
  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Notifications</Title>
          <Text c="dimmed">Updates about your children's activities</Text>
        </div>
        <Button variant="subtle">Mark all as read</Button>
      </Group>

      <Stack gap="md">
        <Card withBorder p="lg">
          <Group justify="space-between">
            <Group>
              <IconCalendar size={24} color="var(--mantine-color-blue-6)" />
              <div>
                <Text fw={500}>Session Reminder</Text>
                <Text size="sm" c="dimmed">
                  Weekly Training is scheduled for next Monday at 4:00 PM
                </Text>
                <Text size="xs" c="dimmed" mt="xs">Just now</Text>
              </div>
            </Group>
            <Badge color="blue">New</Badge>
          </Group>
        </Card>

        <Card withBorder p="lg" opacity={0.7}>
          <Group justify="space-between">
            <Group>
              <IconCheck size={24} color="var(--mantine-color-green-6)" />
              <div>
                <Text fw={500}>Group Joined</Text>
                <Text size="sm" c="dimmed">
                  Jamie has joined the Beginners group
                </Text>
                <Text size="xs" c="dimmed" mt="xs">1 hour ago</Text>
              </div>
            </Group>
            <ActionIcon variant="subtle">
              <IconCheck size={16} />
            </ActionIcon>
          </Group>
        </Card>
      </Stack>

      {/* Empty state for when there are no notifications */}
      {false && (
        <Card withBorder p="xl" ta="center">
          <IconBell size={48} color="gray" style={{ opacity: 0.5 }} />
          <Text size="lg" fw={500} mt="md">No notifications</Text>
          <Text size="sm" c="dimmed">
            You're all caught up! New notifications will appear here.
          </Text>
        </Card>
      )}
    </Container>
  );
}
