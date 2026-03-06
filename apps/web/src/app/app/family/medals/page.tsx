'use client';

import { useState, useEffect } from 'react';
import {
  Container, Title, Text, Card, SimpleGrid, Badge, Group, Stack,
  ThemeIcon, Loader, Center, Tabs, Avatar
} from '@mantine/core';
import { IconMedal, IconTrophy } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { getChildren, getMemberGroups } from '@dojodash/firebase';
import type { Child } from '@dojodash/core';
import { EmptyState } from '@dojodash/ui';

interface Medal {
  id: string;
  name: string;
  description: string;
  xpValue: number;
  color: string;
  awardedAt: Date;
}

function ChildMedals({ child, hasGroups }: { child: Child; hasGroups: boolean }) {
  // TODO: Fetch real medals for this child
  const medals: Medal[] = [];

  return (
    <>
      <Group mb="xl">
        <Card withBorder p="lg">
          <Group>
            <ThemeIcon size="xl" color="yellow" variant="light">
              <IconTrophy size={24} />
            </ThemeIcon>
            <div>
              <Text size="xl" fw={700}>
                {medals.length}
              </Text>
              <Text size="sm" c="dimmed">
                Total Medals
              </Text>
            </div>
          </Group>
        </Card>
      </Group>

      {medals.length === 0 ? (
        <EmptyState
          icon={<IconMedal size={32} />}
          title="No medals yet"
          description={
            hasGroups
              ? "Keep training! Medals are awarded for achievements and outstanding performance."
              : "Join a training group to start earning medals for your achievements."
          }
          color="yellow"
        />
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {medals.map((medal) => (
            <Card
              key={medal.id}
              withBorder
              p="lg"
              style={{ borderLeft: `4px solid var(--mantine-color-${medal.color}-5)` }}
            >
              <Group justify="space-between" mb="sm">
                <Text fw={500}>{medal.name}</Text>
                <Badge color={medal.color}>{medal.xpValue} XP</Badge>
              </Group>
              <Text size="sm" c="dimmed">
                {medal.description}
              </Text>
              <Text size="xs" c="dimmed" mt="sm">
                Earned {medal.awardedAt.toLocaleDateString()}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </>
  );
}

export default function FamilyMedalsPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasGroups, setHasGroups] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [childrenData, memberGroups] = await Promise.all([
        getChildren(user.uid),
        getMemberGroups(user.uid),
      ]);
      setChildren(childrenData);
      setHasGroups(memberGroups.length > 0);
      if (childrenData.length > 0 && childrenData[0]) {
        setActiveTab(childrenData[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
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
        <Title order={2} mb="xs">Medals</Title>
        <Text c="dimmed" mb="xl">Earned medals and awards</Text>

        {children.length === 0 ? (
          <EmptyState
            icon={<IconMedal size={32} />}
            title="No children yet"
            description="Add a child to start tracking their medals."
            action={{ label: 'Add Child', onClick: () => window.location.href = '/app/family' }}
            color="yellow"
          />
        ) : children.length === 1 ? (
          // Single child - no tabs needed
          <ChildMedals child={children[0]!} hasGroups={hasGroups} />
        ) : (
          // Multiple children - use tabs
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List mb="xl">
              {children.map((child) => (
                <Tabs.Tab
                  key={child.id}
                  value={child.id}
                  leftSection={
                    <Avatar size="sm" radius="xl" color="yellow">
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
                <ChildMedals child={child} hasGroups={hasGroups} />
              </Tabs.Panel>
            ))}
          </Tabs>
        )}
      </Container>
    </AuthGuard>
  );
}
