'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Title, Text, SimpleGrid, Paper, Stack, Card, Group, Button, Badge,
  Avatar, Checkbox, Modal, Select, TextInput, Loader, Center, ActionIcon,
  Tooltip
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconUsers, IconCalendar, IconChartBar, IconCheck,
  IconTrophy, IconUserCheck
} from '@tabler/icons-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { StatsCard } from '@dojodash/ui/components';
import { useAuth } from '@/hooks/useAuth';
import {
  getSessions, getGroups, getGroupMembers, updateSession,
  getMedalTemplates, awardMedal, getRecentMedals
} from '@dojodash/firebase';
import { MedalGraphic } from '@dojodash/ui/components';
import type { Session, Group as GroupType, GroupMember, MedalTemplate, Medal } from '@dojodash/core';

export default function CoachDashboard() {
  const { user, claims } = useAuth();
  const router = useRouter();
  const clubId = claims?.clubIds?.[0] || '';

  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [rewardTemplates, setRewardTemplates] = useState<MedalTemplate[]>([]);
  const [recentMedals, setRecentMedals] = useState<Medal[]>([]);
  const [todaysSessions, setTodaysSessions] = useState<Session[]>([]);

  // Attendance modal state
  const [attendanceOpened, { open: openAttendance, close: closeAttendance }] = useDisclosure(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessionMembers, setSessionMembers] = useState<GroupMember[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Reward modal state
  const [rewardOpened, { open: openReward, close: closeReward }] = useDisclosure(false);
  const [rewardMember, setRewardMember] = useState<GroupMember | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [rewardNote, setRewardNote] = useState('');

  useEffect(() => {
    if (clubId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [clubId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessionsData, groupsData, templatesData, medalsData] = await Promise.all([
        getSessions(clubId),
        getGroups(clubId),
        getMedalTemplates(clubId),
        getRecentMedals(clubId, 5),
      ]);

      setGroups(groupsData);
      setRewardTemplates(templatesData);
      setRecentMedals(medalsData);

      // Filter today's sessions
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todaysFiltered = sessionsData.filter(s => {
        if (!s.date?.seconds) return false;
        const sessionDate = new Date(s.date.seconds * 1000);
        return sessionDate >= today && sessionDate < tomorrow && s.status === 'scheduled';
      });
      setTodaysSessions(todaysFiltered);

    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGroupName = (groupId: string) => {
    return groups.find(g => g.id === groupId)?.name ?? 'Unknown';
  };

  const getGroupColor = (groupId: string) => {
    return groups.find(g => g.id === groupId)?.color ?? 'blue';
  };

  const formatTime = (session: Session | null) => {
    if (!session?.startTime) return '';
    return `${session.startTime.hour}:${String(session.startTime.minute).padStart(2, '0')}`;
  };

  const getTotalMembers = () => {
    return groups.reduce((sum, g) => sum + (g.memberCount || 0), 0);
  };

  const handleOpenAttendance = async (session: Session) => {
    setSelectedSession(session);
    try {
      const members = await getGroupMembers(clubId, session.groupId);
      setSessionMembers(members);
      const initialAttendance: Record<string, boolean> = {};
      members.forEach(m => {
        initialAttendance[m.childId] = true;
      });
      setAttendance(initialAttendance);
      openAttendance();
    } catch (error) {
      console.error('Failed to load members:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load group members',
        color: 'red',
      });
    }
  };

  const handleSaveAttendance = async () => {
    if (!selectedSession) return;

    setSavingAttendance(true);
    try {
      await updateSession(clubId, selectedSession.id, {
        status: 'completed',
      });

      notifications.show({
        title: 'Attendance Saved',
        message: `Marked ${Object.values(attendance).filter(Boolean).length} members present`,
        color: 'green',
      });

      closeAttendance();
      loadData();
    } catch (error) {
      console.error('Failed to save attendance:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save attendance',
        color: 'red',
      });
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleOpenReward = (member: GroupMember) => {
    setRewardMember(member);
    setSelectedTemplateId(null);
    setRewardNote('');
    openReward();
  };

  const handleGiveReward = async () => {
    if (!rewardMember || !selectedTemplateId || !selectedSession) return;

    const template = rewardTemplates.find(t => t.id === selectedTemplateId);
    if (!template) return;

    try {
      await awardMedal(clubId, {
        templateId: template.id,
        childId: rewardMember.childId,
        clubId,
        groupId: selectedSession.groupId,
        name: template.name,
        description: template.description,
        color: template.color,
        xpValue: template.xpValue,
        category: template.category,
        awardedBy: user?.uid ?? '',
        awardedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
        reason: rewardNote,
        recipientName: rewardMember.childName,
        groupName: getGroupName(selectedSession.groupId),
      });

      notifications.show({
        title: 'Reward Given!',
        message: `${template.name} (+${template.xpValue} XP) awarded to ${rewardMember.childName}`,
        color: 'green',
        icon: <IconTrophy size={16} />,
      });

      closeReward();
    } catch (error) {
      console.error('Failed to give reward:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to give reward',
        color: 'red',
      });
    }
  };

  const selectedTemplate = rewardTemplates.find(t => t.id === selectedTemplateId);

  if (loading) {
    return (
      <AuthGuard allowedRoles={['ADMIN', 'COACH']}>
        <Center h={300}>
          <Loader size="lg" />
        </Center>
      </AuthGuard>
    );
  }

  if (!clubId) {
    return (
      <AuthGuard allowedRoles={['ADMIN', 'COACH']}>
        <Center h={300}>
          <Stack align="center" gap="md">
            <IconUsers size={48} color="gray" style={{ opacity: 0.5 }} />
            <Text c="dimmed" ta="center">
              You are not assigned to any club yet.<br />
              Please contact an administrator.
            </Text>
          </Stack>
        </Center>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={['ADMIN', 'COACH']}>
      <Stack gap="lg">
        <div>
          <Title order={2}>Coach Dashboard</Title>
          <Text c="dimmed">Manage your club and groups</Text>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2 }} maw={400}>
          <Paper
            p="md"
            withBorder
            style={{ cursor: 'pointer' }}
            onClick={() => router.push('/app/coach/members')}
          >
            <StatsCard
              title="Total Members"
              value={String(getTotalMembers())}
              icon={<IconUsers size={24} />}
              color="blue"
            />
          </Paper>
          <Paper
            p="md"
            withBorder
            style={{ cursor: 'pointer' }}
            onClick={() => router.push('/app/coach/groups')}
          >
            <StatsCard
              title="Groups"
              value={String(groups.length)}
              icon={<IconChartBar size={24} />}
              color="violet"
            />
          </Paper>
        </SimpleGrid>

        <Paper p="lg" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={4}>Today's Sessions</Title>
            <Text size="sm" c="dimmed">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </Group>

          {todaysSessions.length === 0 ? (
            <Text c="dimmed">No sessions scheduled for today.</Text>
          ) : (
            <Stack gap="md">
              {todaysSessions.map(session => (
                <Card key={session.id} withBorder padding="md">
                  <Group justify="space-between">
                    <Group>
                      <Avatar color={getGroupColor(session.groupId)} radius="xl">
                        {getGroupName(session.groupId)[0]}
                      </Avatar>
                      <div>
                        <Text fw={500}>{session.title}</Text>
                        <Group gap="xs">
                          <Badge variant="light" color={getGroupColor(session.groupId)}>
                            {getGroupName(session.groupId)}
                          </Badge>
                          <Text size="sm" c="dimmed">
                            {formatTime(session)}
                          </Text>
                        </Group>
                      </div>
                    </Group>
                    <Group>
                      <Button
                        leftSection={<IconUserCheck size={16} />}
                        variant="light"
                        onClick={() => handleOpenAttendance(session)}
                      >
                        Take Attendance
                      </Button>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Paper>

        <Paper p="lg" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={4}>Recent Awards</Title>
            <Button variant="subtle" size="sm" component="a" href="/app/coach/rewards">
              View All
            </Button>
          </Group>

          {recentMedals.length === 0 ? (
            <Text c="dimmed">No awards given yet. Start recognizing your students!</Text>
          ) : (
            <Group gap="md">
              {recentMedals.map(medal => (
                <Card key={medal.id} withBorder padding="sm" style={{ minWidth: 160 }}>
                  <Stack align="center" gap="xs">
                    <MedalGraphic
                      name={medal.name}
                      customText={medal.customText}
                      color={medal.color}
                      shape={medal.shape}
                      borderStyle={medal.borderStyle}
                      size="sm"
                      isChampionship={medal.isChampionship}
                    />
                    {medal.recipientName && (
                      <Text size="sm" fw={500} ta="center">
                        {medal.recipientName}
                      </Text>
                    )}
                    <Text size="xs" c="dimmed" ta="center">
                      {medal.groupName && `${medal.groupName} • `}
                      {medal.awardedAt?.seconds
                        ? new Date(medal.awardedAt.seconds * 1000).toLocaleDateString()
                        : 'Recently'}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </Group>
          )}
        </Paper>

        <Paper p="lg" withBorder>
          <Title order={4} mb="md">Quick Actions</Title>
          <Group>
            <Button variant="light" leftSection={<IconCalendar size={16} />} component="a" href="/app/coach/schedule">
              View Schedule
            </Button>
            <Button variant="light" leftSection={<IconUsers size={16} />} component="a" href="/app/coach/groups">
              Manage Groups
            </Button>
            <Button variant="light" leftSection={<IconTrophy size={16} />} component="a" href="/app/coach/rewards">
              Rewards & Goals
            </Button>
          </Group>
        </Paper>
      </Stack>

      {/* Attendance Modal */}
      <Modal
        opened={attendanceOpened}
        onClose={closeAttendance}
        title={
          <Group>
            <IconUserCheck size={20} />
            <Text fw={500}>Take Attendance - {selectedSession?.title}</Text>
          </Group>
        }
        size="md"
      >
        <Stack>
          <Text size="sm" c="dimmed">
            {getGroupName(selectedSession?.groupId ?? '')} • {formatTime(selectedSession)}
          </Text>

          {sessionMembers.length === 0 ? (
            <Text c="dimmed" ta="center" py="lg">
              No members in this group yet.
            </Text>
          ) : (
            <Stack gap="xs">
              {sessionMembers.map(member => (
                <Card key={member.childId} withBorder padding="sm">
                  <Group justify="space-between">
                    <Group>
                      <Checkbox
                        checked={attendance[member.childId] ?? false}
                        onChange={(e) => setAttendance({
                          ...attendance,
                          [member.childId]: e.currentTarget.checked
                        })}
                      />
                      <Avatar color="blue" radius="xl" size="sm">
                        {member.childName[0]}
                      </Avatar>
                      <Text size="sm">{member.childName}</Text>
                    </Group>
                    <Tooltip label="Give reward">
                      <ActionIcon
                        variant="subtle"
                        color="yellow"
                        onClick={() => handleOpenReward(member)}
                        disabled={rewardTemplates.length === 0}
                      >
                        <IconTrophy size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}

          <Group justify="space-between" mt="md">
            <Text size="sm" c="dimmed">
              {Object.values(attendance).filter(Boolean).length} / {sessionMembers.length} present
            </Text>
            <Group>
              <Button variant="subtle" onClick={closeAttendance}>Cancel</Button>
              <Button
                leftSection={<IconCheck size={16} />}
                onClick={handleSaveAttendance}
                loading={savingAttendance}
              >
                Save Attendance
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>

      {/* Reward Modal */}
      <Modal
        opened={rewardOpened}
        onClose={closeReward}
        title={
          <Group>
            <IconTrophy size={20} />
            <Text fw={500}>Give Reward to {rewardMember?.childName}</Text>
          </Group>
        }
        size="sm"
      >
        <Stack>
          {rewardTemplates.length === 0 ? (
            <Paper p="md" bg="yellow.0" radius="md">
              <Text size="sm" c="yellow.8">
                No rewards created yet. Go to{' '}
                <Text component="a" href="/app/coach/rewards" c="blue" style={{ cursor: 'pointer' }}>
                  Rewards & Goals
                </Text>{' '}
                to create custom rewards.
              </Text>
            </Paper>
          ) : (
            <>
              <Select
                label="Reward Type"
                placeholder="Select a reward"
                data={rewardTemplates.map(t => ({
                  value: t.id,
                  label: `${t.name} (+${t.xpValue} XP)`,
                }))}
                value={selectedTemplateId}
                onChange={setSelectedTemplateId}
              />

              {selectedTemplate && (
                <Paper p="sm" bg="green.0" radius="md">
                  <Text size="sm" c="green.8">
                    Awarding <strong>{selectedTemplate.name}</strong> • +{selectedTemplate.xpValue} XP
                  </Text>
                </Paper>
              )}

              <TextInput
                label="Note (optional)"
                placeholder="Add a personal note..."
                value={rewardNote}
                onChange={(e) => setRewardNote(e.currentTarget.value)}
              />
            </>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeReward}>Cancel</Button>
            <Button
              leftSection={<IconTrophy size={16} />}
              onClick={handleGiveReward}
              disabled={!selectedTemplateId}
              color="yellow"
            >
              Give Reward
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AuthGuard>
  );
}
