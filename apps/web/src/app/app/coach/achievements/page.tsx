'use client';

import { Container, Title, Text, Card, SimpleGrid, Badge, Group, Stack, ThemeIcon } from '@mantine/core';
import { IconTrophy, IconFlame, IconStar, IconMedal } from '@tabler/icons-react';

export default function CoachAchievementsPage() {
  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xs">Achievements</Title>
      <Text c="dimmed" mb="xl">Team achievements and milestones</Text>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        <Card withBorder p="lg">
          <Group mb="md">
            <ThemeIcon size="xl" color="yellow" variant="light">
              <IconTrophy size={24} />
            </ThemeIcon>
            <div>
              <Text fw={500}>First Session</Text>
              <Badge size="sm" color="green">Unlocked</Badge>
            </div>
          </Group>
          <Text size="sm" c="dimmed">Complete your first training session</Text>
        </Card>

        <Card withBorder p="lg">
          <Group mb="md">
            <ThemeIcon size="xl" color="orange" variant="light">
              <IconFlame size={24} />
            </ThemeIcon>
            <div>
              <Text fw={500}>5 Day Streak</Text>
              <Badge size="sm" color="gray">Locked</Badge>
            </div>
          </Group>
          <Text size="sm" c="dimmed">Have a student achieve a 5-day streak</Text>
        </Card>

        <Card withBorder p="lg">
          <Group mb="md">
            <ThemeIcon size="xl" color="blue" variant="light">
              <IconStar size={24} />
            </ThemeIcon>
            <div>
              <Text fw={500}>Medal Master</Text>
              <Badge size="sm" color="gray">Locked</Badge>
            </div>
          </Group>
          <Text size="sm" c="dimmed">Award 10 medals to students</Text>
        </Card>

        <Card withBorder p="lg">
          <Group mb="md">
            <ThemeIcon size="xl" color="violet" variant="light">
              <IconMedal size={24} />
            </ThemeIcon>
            <div>
              <Text fw={500}>Full House</Text>
              <Badge size="sm" color="gray">Locked</Badge>
            </div>
          </Group>
          <Text size="sm" c="dimmed">Achieve 100% attendance in a session</Text>
        </Card>
      </SimpleGrid>
    </Container>
  );
}
