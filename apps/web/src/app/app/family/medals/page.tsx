'use client';

import { useState, useEffect } from 'react';
import {
  Container, Title, Text, Card, SimpleGrid, Badge, Group, Stack,
  ThemeIcon, Loader, Center, Tabs, Avatar
} from '@mantine/core';
import { IconMedal, IconTrophy } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { getChildren, getMemberGroups, getChildMedals } from '@dojodash/firebase';
import { MedalGraphic } from '@dojodash/ui/components';
import type { Child, Medal } from '@dojodash/core';

function ChildMedals({ child, clubIds, hasGroups }: { child: Child; clubIds: string[]; hasGroups: boolean }) {
  const [medals, setMedals] = useState<Medal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedals();
  }, [child.id, clubIds]);

  const loadMedals = async () => {
    try {
      setLoading(true);
      // Fetch medals from all clubs the child might be in
      const allMedals: Medal[] = [];
      for (const clubId of clubIds) {
        const clubMedals = await getChildMedals(clubId, child.id);
        allMedals.push(...clubMedals);
      }
      // Sort by awarded date descending
      allMedals.sort((a, b) => {
        const aTime = a.awardedAt?.seconds || 0;
        const bTime = b.awardedAt?.seconds || 0;
        return bTime - aTime;
      });
      setMedals(allMedals);
    } catch (error) {
      console.error('Failed to load medals:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: { seconds: number; nanoseconds: number } | undefined) => {
    if (!timestamp) return 'Recently';
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <Center h={200}>
        <Loader size="md" />
      </Center>
    );
  }

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
        <Card withBorder p="xl" ta="center">
          <IconMedal size={48} color="gray" style={{ opacity: 0.5 }} />
          <Text size="lg" fw={500} mt="md">No medals yet</Text>
          <Text size="sm" c="dimmed">
            {hasGroups
              ? "Keep training! Medals are awarded for achievements and outstanding performance."
              : "Join a training group to start earning medals for your achievements."}
          </Text>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {medals.map((medal) => (
            <Card key={medal.id} withBorder p="lg">
              <Stack align="center" gap="sm">
                <MedalGraphic
                  name={medal.name}
                  customText={medal.customText}
                  color={medal.color}
                  shape={medal.shape}
                  borderStyle={medal.borderStyle}
                  size="md"
                  isChampionship={medal.isChampionship}
                />
                <Badge color="green" variant="light">+{medal.xpValue} XP</Badge>
                {medal.description && (
                  <Text size="sm" c="dimmed" ta="center">{medal.description}</Text>
                )}
                <Text size="xs" c="dimmed">
                  {medal.groupName && `${medal.groupName} • `}
                  {formatDate(medal.awardedAt as any)}
                </Text>
              </Stack>
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
  const [clubIds, setClubIds] = useState<string[]>([]);

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
      // Extract unique clubIds from memberGroups
      const uniqueClubIds = [...new Set(memberGroups.map(mg => mg.clubId))];
      setClubIds(uniqueClubIds);
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
          <Card withBorder p="xl" ta="center">
            <IconMedal size={48} color="gray" style={{ opacity: 0.5 }} />
            <Text size="lg" fw={500} mt="md">No children yet</Text>
            <Text size="sm" c="dimmed">Add a child to start tracking their medals.</Text>
          </Card>
        ) : children.length === 1 ? (
          // Single child - no tabs needed
          <ChildMedals child={children[0]!} clubIds={clubIds} hasGroups={hasGroups} />
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
                <ChildMedals child={child} clubIds={clubIds} hasGroups={hasGroups} />
              </Tabs.Panel>
            ))}
          </Tabs>
        )}
      </Container>
    </AuthGuard>
  );
}
