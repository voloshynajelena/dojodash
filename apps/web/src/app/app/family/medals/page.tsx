'use client';

import { Container, Title, Text, Card, SimpleGrid, Badge, Group, Stack, ThemeIcon } from '@mantine/core';
import { IconMedal, IconTrophy } from '@tabler/icons-react';

export default function FamilyMedalsPage() {
  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xs">Medals</Title>
      <Text c="dimmed" mb="xl">Your child's earned medals and awards</Text>

      <Group mb="xl">
        <Card withBorder p="lg">
          <Group>
            <ThemeIcon size="xl" color="yellow" variant="light">
              <IconTrophy size={24} />
            </ThemeIcon>
            <div>
              <Text size="xl" fw={700}>0</Text>
              <Text size="sm" c="dimmed">Total Medals</Text>
            </div>
          </Group>
        </Card>
      </Group>

      <Card withBorder p="xl" ta="center">
        <IconMedal size={48} color="gray" style={{ opacity: 0.5 }} />
        <Text size="lg" fw={500} mt="md">No medals yet</Text>
        <Text size="sm" c="dimmed">
          Keep training! Medals are awarded for achievements and outstanding performance.
        </Text>
      </Card>

      <Title order={4} mt="xl" mb="md">Available Medals</Title>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        <Card withBorder p="lg" style={{ borderLeft: '4px solid #FFD700' }}>
          <Group justify="space-between" mb="sm">
            <Text fw={500}>Star Performer</Text>
            <Badge color="yellow">25 XP</Badge>
          </Group>
          <Text size="sm" c="dimmed">For outstanding effort in class</Text>
        </Card>

        <Card withBorder p="lg" style={{ borderLeft: '4px solid #3B82F6' }}>
          <Group justify="space-between" mb="sm">
            <Text fw={500}>Skill Master</Text>
            <Badge color="blue">50 XP</Badge>
          </Group>
          <Text size="sm" c="dimmed">Mastered a new technique</Text>
        </Card>
      </SimpleGrid>
    </Container>
  );
}
