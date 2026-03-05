'use client';

import { Container, Title, Text, Card, Stack, Switch, Group, Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

export default function FamilyPrivacyPage() {
  return (
    <Container size="md" py="xl">
      <Title order={2} mb="xs">Privacy Settings</Title>
      <Text c="dimmed" mb="xl">Control how your child's information is displayed</Text>

      <Alert icon={<IconInfoCircle size={16} />} mb="xl">
        These settings control what information is visible to other members of your club.
        Your child's data is always private to coaches and administrators.
      </Alert>

      <Card withBorder p="lg">
        <Stack gap="lg">
          <Title order={4}>Jamie's Privacy Settings</Title>

          <Group justify="space-between">
            <div>
              <Text fw={500}>Show on Leaderboard</Text>
              <Text size="sm" c="dimmed">
                Display your child's name and stats on the club leaderboard
              </Text>
            </div>
            <Switch defaultChecked />
          </Group>

          <Group justify="space-between">
            <div>
              <Text fw={500}>Show Full Name</Text>
              <Text size="sm" c="dimmed">
                Display full name instead of first name only
              </Text>
            </div>
            <Switch />
          </Group>

          <Group justify="space-between">
            <div>
              <Text fw={500}>Show Photo</Text>
              <Text size="sm" c="dimmed">
                Display profile photo on leaderboard and in group views
              </Text>
            </div>
            <Switch />
          </Group>
        </Stack>
      </Card>

      <Card withBorder p="lg" mt="xl">
        <Title order={4} mb="md">Data Usage</Title>
        <Text size="sm" c="dimmed">
          Your data is used only for the purpose of tracking attendance, progress, and achievements
          within DojoDash. We do not share your personal information with third parties.
        </Text>
      </Card>
    </Container>
  );
}
