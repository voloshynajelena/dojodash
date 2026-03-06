'use client';

import { useState, useEffect } from 'react';
import {
  Container, Title, Text, Card, SimpleGrid, Progress, Group, Stack, RingProgress,
  Loader, Center, Tabs, Avatar
} from '@mantine/core';
import { IconFlame, IconTrophy, IconTarget, IconTrendingUp, IconChartBar, IconUser } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { getChildren } from '@dojodash/firebase';
import type { Child } from '@dojodash/core';
import { EmptyState } from '@dojodash/ui';

// XP thresholds per level
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 15000, 30000];

function getLevelProgress(xp: number, level: number): { current: number; next: number; percent: number } {
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || currentThreshold + 1000;
  const progress = xp - currentThreshold;
  const required = nextThreshold - currentThreshold;
  const percent = Math.min(100, Math.round((progress / required) * 100));
  return { current: xp, next: nextThreshold, percent };
}

function ChildStats({ child }: { child: Child }) {
  const stats = child.stats || {
    totalXP: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    totalSessions: 0,
    attendedSessions: 0,
  };

  const levelProgress = getLevelProgress(stats.totalXP, stats.level);
  const attendanceRate =
    stats.totalSessions > 0 ? Math.round((stats.attendedSessions / stats.totalSessions) * 100) : 0;

  return (
    <>
      <SimpleGrid cols={{ base: 2, md: 4 }} mb="xl">
        <Card withBorder p="lg" ta="center">
          <IconTrophy size={32} color="var(--mantine-color-yellow-6)" />
          <Text size="xl" fw={700} mt="xs">
            {stats.totalXP}
          </Text>
          <Text size="sm" c="dimmed">
            Total XP
          </Text>
        </Card>

        <Card withBorder p="lg" ta="center">
          <IconTrendingUp size={32} color="var(--mantine-color-blue-6)" />
          <Text size="xl" fw={700} mt="xs">
            Level {stats.level}
          </Text>
          <Text size="sm" c="dimmed">
            Current Level
          </Text>
        </Card>

        <Card withBorder p="lg" ta="center">
          <IconFlame size={32} color="var(--mantine-color-orange-6)" />
          <Text size="xl" fw={700} mt="xs">
            {stats.currentStreak} Day{stats.currentStreak !== 1 ? 's' : ''}
          </Text>
          <Text size="sm" c="dimmed">
            Current Streak
          </Text>
        </Card>

        <Card withBorder p="lg" ta="center">
          <IconTarget size={32} color="var(--mantine-color-green-6)" />
          <Text size="xl" fw={700} mt="xs">
            {stats.longestStreak} Day{stats.longestStreak !== 1 ? 's' : ''}
          </Text>
          <Text size="sm" c="dimmed">
            Best Streak
          </Text>
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card withBorder p="lg">
          <Title order={4} mb="md">
            Level Progress
          </Title>
          <Group justify="center" mb="md">
            <RingProgress
              size={180}
              thickness={20}
              sections={[{ value: levelProgress.percent, color: 'blue' }]}
              label={
                <Stack align="center" gap={0}>
                  <Text size="xl" fw={700}>
                    Level {stats.level}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {levelProgress.percent}%
                  </Text>
                </Stack>
              }
            />
          </Group>
          <Group justify="space-between">
            <Text size="sm">{stats.totalXP} XP</Text>
            <Text size="sm" c="dimmed">
              Next: {levelProgress.next} XP
            </Text>
          </Group>
          <Progress value={levelProgress.percent} size="lg" mt="xs" />
        </Card>

        <Card withBorder p="lg">
          <Title order={4} mb="md">
            Attendance Stats
          </Title>
          <Stack gap="md">
            <div>
              <Group justify="space-between" mb="xs">
                <Text size="sm">Total Sessions</Text>
                <Text size="sm" fw={500}>
                  {stats.totalSessions}
                </Text>
              </Group>
              <Progress value={100} size="sm" />
            </div>
            <div>
              <Group justify="space-between" mb="xs">
                <Text size="sm">Attended</Text>
                <Text size="sm" fw={500} c="green">
                  {stats.attendedSessions}
                </Text>
              </Group>
              <Progress
                value={stats.totalSessions > 0 ? attendanceRate : 0}
                color="green"
                size="sm"
              />
            </div>
            <div>
              <Group justify="space-between" mb="xs">
                <Text size="sm">Attendance Rate</Text>
                <Text size="sm" fw={500} c="blue">
                  {attendanceRate}%
                </Text>
              </Group>
              <Progress value={attendanceRate} color="blue" size="sm" />
            </div>
          </Stack>
        </Card>
      </SimpleGrid>
    </>
  );
}

export default function FamilyStatsPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getChildren(user.uid);
      setChildren(data);
      if (data.length > 0 && data[0]) {
        setActiveTab(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load children:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard allowedRoles={['FAMILY']}>
        <Container size="lg" py="xl">
          <Center h={300}>
            <Loader size="lg" />
          </Center>
        </Container>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={['FAMILY']}>
      <Container size="lg" py="xl">
        <Title order={2} mb="xs">Stats & Progress</Title>
        <Text c="dimmed" mb="xl">Track your children's achievements</Text>

        {children.length === 0 ? (
          <EmptyState
            icon={<IconChartBar size={32} />}
            title="No children yet"
            description="Add a child to start tracking their stats and progress."
            action={{ label: 'Add Child', onClick: () => window.location.href = '/app/family' }}
            color="blue"
          />
        ) : children.length === 1 ? (
          // Single child - no tabs needed
          <ChildStats child={children[0]!} />
        ) : (
          // Multiple children - use tabs
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List mb="xl">
              {children.map((child) => (
                <Tabs.Tab
                  key={child.id}
                  value={child.id}
                  leftSection={
                    <Avatar size="sm" radius="xl" color="blue">
                      {child.firstName[0]}
                    </Avatar>
                  }
                >
                  {child.firstName}
                </Tabs.Tab>
              ))}
            </Tabs.List>

            {children.map((child) => (
              <Tabs.Panel key={child.id} value={child.id}>
                <ChildStats child={child} />
              </Tabs.Panel>
            ))}
          </Tabs>
        )}
      </Container>
    </AuthGuard>
  );
}
