'use client';

import { useState, useEffect } from 'react';
import {
  Title, Text, Stack, Button, Modal, TextInput, Group, Card, Avatar, Badge,
  ActionIcon, Loader, Center, Select, Tabs, SimpleGrid, Progress, RingProgress,
  ThemeIcon, Container
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm, zodResolver } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import {
  IconPlus, IconUser, IconEdit, IconTrash, IconFlame, IconTrophy,
  IconTarget, IconTrendingUp, IconChartBar, IconMedal
} from '@tabler/icons-react';
import { createChildSchema } from '@dojodash/core';
import type { Child, Group as GroupType, Medal } from '@dojodash/core';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import {
  getChildren, createChild, updateChild, deleteChild,
  getGroups, addGroupMember, removeGroupMember, getMemberGroups, getChildMedals
} from '@dojodash/firebase';
import { MedalGraphic } from '@dojodash/ui/components';

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

function ChildOverview({
  child,
  groups,
  onEdit,
  onDelete,
}: {
  child: Child;
  groups: GroupType[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const formatAge = (dateOfBirth?: { seconds: number; nanoseconds: number }) => {
    if (!dateOfBirth?.seconds) return '-';
    const birth = new Date(dateOfBirth.seconds * 1000);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} years old`;
  };

  const getGroupName = (groupIds?: string[]) => {
    if (!groupIds || groupIds.length === 0) return 'No group';
    const group = groups.find(g => g.id === groupIds[0]);
    return group?.name || 'Unknown';
  };

  const getGroupColor = (groupIds?: string[]) => {
    if (!groupIds || groupIds.length === 0) return 'gray';
    const group = groups.find(g => g.id === groupIds[0]);
    return group?.color || 'gray';
  };

  return (
    <Stack gap="lg">
      <Card withBorder p="lg">
        <Group justify="space-between" mb="md">
          <Title order={4}>Profile</Title>
          <Group gap="xs">
            <ActionIcon variant="light" color="blue" onClick={onEdit}>
              <IconEdit size={18} />
            </ActionIcon>
            <ActionIcon variant="light" color="red" onClick={onDelete}>
              <IconTrash size={18} />
            </ActionIcon>
          </Group>
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
          <div>
            <Text size="sm" c="dimmed">Full Name</Text>
            <Text fw={500}>{child.firstName} {child.lastName}</Text>
          </div>
          {child.nickname && (
            <div>
              <Text size="sm" c="dimmed">Nickname</Text>
              <Text fw={500}>"{child.nickname}"</Text>
            </div>
          )}
          <div>
            <Text size="sm" c="dimmed">Age</Text>
            <Text fw={500}>{formatAge(child.dateOfBirth)}</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">Training Group</Text>
            <Badge color={getGroupColor(child.groupIds)} variant="light">
              {getGroupName(child.groupIds)}
            </Badge>
          </div>
        </SimpleGrid>
      </Card>

      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="yellow" variant="light" mb="xs">
            <IconTrophy size={20} />
          </ThemeIcon>
          <Text size="xl" fw={700}>{child.stats?.totalXP || 0}</Text>
          <Text size="xs" c="dimmed">Total XP</Text>
        </Card>
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="blue" variant="light" mb="xs">
            <IconTrendingUp size={20} />
          </ThemeIcon>
          <Text size="xl" fw={700}>Lvl {child.stats?.level || 1}</Text>
          <Text size="xs" c="dimmed">Level</Text>
        </Card>
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="orange" variant="light" mb="xs">
            <IconFlame size={20} />
          </ThemeIcon>
          <Text size="xl" fw={700}>{child.stats?.currentStreak || 0}</Text>
          <Text size="xs" c="dimmed">Day Streak</Text>
        </Card>
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="green" variant="light" mb="xs">
            <IconTarget size={20} />
          </ThemeIcon>
          <Text size="xl" fw={700}>{child.stats?.attendedSessions || 0}</Text>
          <Text size="xs" c="dimmed">Sessions</Text>
        </Card>
      </SimpleGrid>
    </Stack>
  );
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
    <SimpleGrid cols={{ base: 1, md: 2 }}>
      <Card withBorder p="lg">
        <Title order={4} mb="md">Level Progress</Title>
        <Group justify="center" mb="md">
          <RingProgress
            size={160}
            thickness={16}
            sections={[{ value: levelProgress.percent, color: 'blue' }]}
            label={
              <Stack align="center" gap={0}>
                <Text size="lg" fw={700}>Level {stats.level}</Text>
                <Text size="sm" c="dimmed">{levelProgress.percent}%</Text>
              </Stack>
            }
          />
        </Group>
        <Group justify="space-between">
          <Text size="sm">{stats.totalXP} XP</Text>
          <Text size="sm" c="dimmed">Next: {levelProgress.next} XP</Text>
        </Group>
        <Progress value={levelProgress.percent} size="lg" mt="xs" />
      </Card>

      <Card withBorder p="lg">
        <Title order={4} mb="md">Attendance</Title>
        <Stack gap="md">
          <div>
            <Group justify="space-between" mb="xs">
              <Text size="sm">Total Sessions</Text>
              <Text size="sm" fw={500}>{stats.totalSessions}</Text>
            </Group>
            <Progress value={100} size="sm" color="gray" />
          </div>
          <div>
            <Group justify="space-between" mb="xs">
              <Text size="sm">Attended</Text>
              <Text size="sm" fw={500} c="green">{stats.attendedSessions}</Text>
            </Group>
            <Progress value={stats.totalSessions > 0 ? attendanceRate : 0} color="green" size="sm" />
          </div>
          <div>
            <Group justify="space-between" mb="xs">
              <Text size="sm">Attendance Rate</Text>
              <Text size="sm" fw={500} c="blue">{attendanceRate}%</Text>
            </Group>
            <Progress value={attendanceRate} color="blue" size="sm" />
          </div>
          <div>
            <Group justify="space-between" mb="xs">
              <Text size="sm">Best Streak</Text>
              <Text size="sm" fw={500} c="orange">{stats.longestStreak} days</Text>
            </Group>
          </div>
        </Stack>
      </Card>
    </SimpleGrid>
  );
}

function ChildMedals({ child, clubIds }: { child: Child; clubIds: string[] }) {
  const [medals, setMedals] = useState<Medal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedals();
  }, [child.id, clubIds]);

  const loadMedals = async () => {
    try {
      setLoading(true);
      const allMedals: Medal[] = [];
      for (const clubId of clubIds) {
        const clubMedals = await getChildMedals(clubId, child.id);
        allMedals.push(...clubMedals);
      }
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
    return <Center h={200}><Loader size="md" /></Center>;
  }

  return (
    <>
      <Card withBorder p="md" mb="lg">
        <Group>
          <ThemeIcon size="xl" color="yellow" variant="light">
            <IconTrophy size={24} />
          </ThemeIcon>
          <div>
            <Text size="xl" fw={700}>{medals.length}</Text>
            <Text size="sm" c="dimmed">Total Medals</Text>
          </div>
        </Group>
      </Card>

      {medals.length === 0 ? (
        <Card withBorder p="xl" ta="center">
          <IconMedal size={48} color="gray" style={{ opacity: 0.5 }} />
          <Text size="lg" fw={500} mt="md">No medals yet</Text>
          <Text size="sm" c="dimmed">
            Keep training! Medals are awarded for achievements and outstanding performance.
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

export default function FamilyChildrenPage() {
  const { user } = useAuth();
  const clubId = 'demo-club';

  const [children, setChildren] = useState<Child[]>([]);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [clubIds, setClubIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [activeChildTab, setActiveChildTab] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<string>('overview');
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      nickname: '',
      dateOfBirth: new Date(),
      groupId: '',
    },
    validate: zodResolver(createChildSchema),
  });

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [childrenData, groupsData, memberGroups] = await Promise.all([
        getChildren(user.uid),
        getGroups(clubId),
        getMemberGroups(user.uid),
      ]);
      setChildren(childrenData);
      setGroups(groupsData);
      const uniqueClubIds = [...new Set(memberGroups.map(mg => mg.clubId))];
      setClubIds(uniqueClubIds);
      if (childrenData.length > 0 && childrenData[0]) {
        setActiveChildTab(childrenData[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingChild(null);
    form.reset();
    open();
  };

  const handleOpenEdit = (child: Child) => {
    setEditingChild(child);
    form.setValues({
      firstName: child.firstName,
      lastName: child.lastName,
      nickname: child.nickname || '',
      dateOfBirth: child.dateOfBirth?.seconds
        ? new Date(child.dateOfBirth.seconds * 1000)
        : new Date(),
      groupId: child.groupIds?.[0] || '',
    });
    open();
  };

  const handleSave = async (values: typeof form.values) => {
    if (!user) return;

    try {
      setSaving(true);
      const selectedGroupId = values.groupId;

      if (editingChild) {
        const updateData: Parameters<typeof updateChild>[2] = {
          firstName: values.firstName,
          lastName: values.lastName,
          dateOfBirth: {
            seconds: Math.floor(values.dateOfBirth.getTime() / 1000),
            nanoseconds: 0,
          },
          groupIds: selectedGroupId ? [selectedGroupId] : [],
        };

        if (values.nickname && values.nickname.trim()) {
          updateData.nickname = values.nickname.trim();
        }

        await updateChild(user.uid, editingChild.id, updateData);

        const oldGroupId = editingChild.groupIds?.[0];
        if (oldGroupId !== selectedGroupId) {
          if (oldGroupId) {
            try {
              await removeGroupMember(clubId, oldGroupId, editingChild.id);
            } catch (e) {
              console.warn('Could not remove from old group:', e);
            }
          }
          if (selectedGroupId) {
            await addGroupMember(clubId, selectedGroupId, {
              childId: editingChild.id,
              childName: `${values.firstName} ${values.lastName}`,
              parentUid: user.uid,
              joinedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
              status: 'active',
            });
          }
        }

        notifications.show({
          title: 'Success',
          message: `${values.firstName}'s profile updated`,
          color: 'green',
        });
      } else {
        const childData: Parameters<typeof createChild>[1] = {
          firstName: values.firstName,
          lastName: values.lastName,
          dateOfBirth: {
            seconds: Math.floor(values.dateOfBirth.getTime() / 1000),
            nanoseconds: 0,
          },
          groupIds: selectedGroupId ? [selectedGroupId] : [],
          privacy: {
            showOnLeaderboard: true,
            showFullName: false,
            showPhoto: false,
          },
          stats: {
            totalXP: 0,
            level: 1,
            currentStreak: 0,
            longestStreak: 0,
            totalSessions: 0,
            attendedSessions: 0,
          },
        };

        if (values.nickname && values.nickname.trim()) {
          childData.nickname = values.nickname.trim();
        }

        const childId = await createChild(user.uid, childData);

        if (selectedGroupId) {
          await addGroupMember(clubId, selectedGroupId, {
            childId: childId,
            childName: `${values.firstName} ${values.lastName}`,
            parentUid: user.uid,
            joinedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
            status: 'active',
          });
        }

        notifications.show({
          title: 'Success',
          message: `${values.firstName} added`,
          color: 'green',
        });
      }

      await loadData();
      form.reset();
      setEditingChild(null);
      close();
    } catch (error) {
      console.error('Failed to save child:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save child',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (child: Child) => {
    if (!user) return;
    if (!confirm(`Are you sure you want to remove ${child.firstName}?`)) return;

    try {
      if (child.groupIds) {
        for (const groupId of child.groupIds) {
          try {
            await removeGroupMember(clubId, groupId, child.id);
          } catch (e) {
            console.warn('Could not remove from group:', e);
          }
        }
      }

      await deleteChild(user.uid, child.id);
      notifications.show({
        title: 'Success',
        message: `${child.firstName} removed`,
        color: 'green',
      });
      await loadData();
    } catch (error) {
      console.error('Failed to delete child:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to remove child',
        color: 'red',
      });
    }
  };

  if (loading) {
    return (
      <AuthGuard allowedRoles={['FAMILY']}>
        <Center h={300}>
          <Loader size="lg" />
        </Center>
      </AuthGuard>
    );
  }

  const activeChild = children.find(c => c.id === activeChildTab);

  return (
    <AuthGuard allowedRoles={['FAMILY']}>
      <Container size="lg" py="md">
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={2}>My Children</Title>
            <Text c="dimmed">Manage profiles, stats, and medals</Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={handleOpenAdd}>
            Add Child
          </Button>
        </Group>

        {children.length === 0 ? (
          <Card withBorder p="xl" ta="center">
            <IconUser size={48} color="gray" style={{ opacity: 0.5 }} />
            <Text size="lg" fw={500} mt="md">No children added yet</Text>
            <Text size="sm" c="dimmed" mb="md">Add your first child to start tracking their progress</Text>
            <Button onClick={handleOpenAdd}>Add Child</Button>
          </Card>
        ) : (
          <>
            {/* Child Tabs */}
            <Tabs value={activeChildTab} onChange={setActiveChildTab} mb="lg">
              <Tabs.List>
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
            </Tabs>

            {/* Sub-tabs for active child */}
            {activeChild && (
              <>
                <Tabs value={activeSubTab} onChange={(v) => setActiveSubTab(v || 'overview')} variant="pills" mb="lg">
                  <Tabs.List>
                    <Tabs.Tab value="overview" leftSection={<IconUser size={16} />}>
                      Overview
                    </Tabs.Tab>
                    <Tabs.Tab value="stats" leftSection={<IconChartBar size={16} />}>
                      Stats
                    </Tabs.Tab>
                    <Tabs.Tab value="medals" leftSection={<IconMedal size={16} />}>
                      Medals
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs>

                {activeSubTab === 'overview' && (
                  <ChildOverview
                    child={activeChild}
                    groups={groups}
                    onEdit={() => handleOpenEdit(activeChild)}
                    onDelete={() => handleDelete(activeChild)}
                  />
                )}
                {activeSubTab === 'stats' && <ChildStats child={activeChild} />}
                {activeSubTab === 'medals' && <ChildMedals child={activeChild} clubIds={clubIds} />}
              </>
            )}
          </>
        )}

        <Modal
          opened={opened}
          onClose={() => { close(); setEditingChild(null); }}
          title={editingChild ? 'Edit Child' : 'Add Child'}
        >
          <form onSubmit={form.onSubmit(handleSave)}>
            <Stack>
              <TextInput
                label="First Name"
                placeholder="Child's first name"
                required
                {...form.getInputProps('firstName')}
              />
              <TextInput
                label="Last Name"
                placeholder="Child's last name"
                required
                {...form.getInputProps('lastName')}
              />
              <TextInput
                label="Nickname"
                placeholder="Optional nickname"
                {...form.getInputProps('nickname')}
              />
              <DateInput
                label="Date of Birth"
                placeholder="Select date"
                required
                {...form.getInputProps('dateOfBirth')}
              />
              <Select
                label="Training Group"
                placeholder="Select a group"
                data={[
                  { value: '', label: 'No group' },
                  ...groups.map(g => ({ value: g.id, label: g.name })),
                ]}
                {...form.getInputProps('groupId')}
              />
              <Group justify="flex-end" mt="md">
                <Button variant="subtle" onClick={() => { close(); setEditingChild(null); }} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  {editingChild ? 'Save Changes' : 'Add Child'}
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </Container>
    </AuthGuard>
  );
}
