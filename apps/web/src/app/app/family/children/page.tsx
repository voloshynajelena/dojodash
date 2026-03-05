'use client';

import { Container, Title, Text, Card, Button, Group, SimpleGrid, Avatar, Badge, Stack, Progress } from '@mantine/core';
import { IconPlus, IconFlame, IconTrophy } from '@tabler/icons-react';

export default function FamilyChildrenPage() {
  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>My Children</Title>
          <Text c="dimmed">Manage your children's profiles</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />}>Add Child</Button>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card withBorder p="lg">
          <Group mb="md">
            <Avatar size="lg" color="blue" radius="xl">JJ</Avatar>
            <div>
              <Text fw={500} size="lg">Jamie Jones</Text>
              <Text size="sm" c="dimmed">Age 7 - Beginners</Text>
            </div>
          </Group>

          <SimpleGrid cols={3} mb="md">
            <Card withBorder p="sm" ta="center">
              <Text size="xl" fw={700} c="blue">150</Text>
              <Text size="xs" c="dimmed">Total XP</Text>
            </Card>
            <Card withBorder p="sm" ta="center">
              <Text size="xl" fw={700} c="green">2</Text>
              <Text size="xs" c="dimmed">Level</Text>
            </Card>
            <Card withBorder p="sm" ta="center">
              <Group justify="center" gap={4}>
                <IconFlame size={20} color="var(--mantine-color-orange-6)" />
                <Text size="xl" fw={700} c="orange">3</Text>
              </Group>
              <Text size="xs" c="dimmed">Streak</Text>
            </Card>
          </SimpleGrid>

          <Stack gap="xs" mb="md">
            <Group justify="space-between">
              <Text size="sm">Level Progress</Text>
              <Text size="sm" c="dimmed">150 / 200 XP</Text>
            </Group>
            <Progress value={75} size="sm" />
          </Stack>

          <Group>
            <Button variant="light" size="sm">View Stats</Button>
            <Button variant="light" size="sm">Edit Profile</Button>
          </Group>
        </Card>
      </SimpleGrid>
    </Container>
  );
}
