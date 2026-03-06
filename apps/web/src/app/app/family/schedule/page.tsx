'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Container, Title, Text, Card, Group, Badge, Select, Button,
  Stack, Loader, Center, SegmentedControl, ActionIcon, Box, Tooltip, Divider, SimpleGrid
} from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconCalendarEvent } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { getMemberGroups, getSessions } from '@dojodash/firebase';
import type { Session, Group as GroupType } from '@dojodash/core';
import { EmptyState } from '@dojodash/ui';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type ViewType = 'month' | 'week';

// Helper to get start of week (Monday)
const getWeekStart = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  // Convert Sunday (0) to 7 for easier Monday-based calculation
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export default function FamilySchedulePage() {
  const { user } = useAuth();
  const clubId = 'demo-club';

  const [sessions, setSessions] = useState<Session[]>([]);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [memberGroupIds, setMemberGroupIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState<string | null>('all');
  const [viewType, setViewType] = useState<ViewType>('week');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(getWeekStart(new Date()));

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get groups the user is a member of
      const memberGroups = await getMemberGroups(user.uid);
      const groupIds = memberGroups.map((mg) => mg.groupId);
      setMemberGroupIds(groupIds);
      setGroups(memberGroups.map((mg) => mg.group));

      // Get sessions for all member groups
      const allSessions: Session[] = [];
      for (const groupId of groupIds) {
        const groupSessions = await getSessions(clubId, groupId);
        allSessions.push(...groupSessions);
      }

      // Sort by date
      allSessions.sort((a, b) => {
        const aTime = a.date?.seconds || 0;
        const bTime = b.date?.seconds || 0;
        return aTime - bTime;
      });

      setSessions(allSessions);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeShort = (session: Session) => {
    if (!session.startTime) return '';
    return `${session.startTime.hour}:${String(session.startTime.minute).padStart(2, '0')}`;
  };

  const getGroupName = (groupId: string) => {
    return groups.find((g) => g.id === groupId)?.name ?? 'Unknown';
  };

  const getGroupColor = (groupId: string) => {
    return groups.find((g) => g.id === groupId)?.color ?? 'blue';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'blue';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const filteredSessions = sessions.filter((session) => {
    if (filterGroup !== 'all' && session.groupId !== filterGroup) return false;
    if (session.status === 'cancelled') return false;
    return true;
  });

  // Calendar helpers
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    // Convert Sunday (0) to 7 for Monday-based week
    const dayOfWeek = firstDay.getDay();
    const startOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const totalDays = lastDay.getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = startOffset - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }

    // Current month
    for (let i = 1; i <= totalDays; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Next month padding (to complete 6 rows)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  }, [currentMonth]);

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, Session[]>();
    filteredSessions.forEach((session) => {
      if (session.date?.seconds) {
        const date = new Date(session.date.seconds * 1000);
        const key = date.toDateString();
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(session);
      }
    });
    return map;
  }, [filteredSessions]);

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToPrevWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setCurrentWeek(getWeekStart(new Date()));
  };

  const getWeekDays = () => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const formatWeekRange = () => {
    const start = currentWeek;
    const end = new Date(currentWeek);
    end.setDate(end.getDate() + 6);
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
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
        <Group justify="space-between" mb="md">
          <div>
            <Title order={2}>Training Schedule</Title>
            <Text c="dimmed">View upcoming training sessions</Text>
          </div>
          <Group gap="xs">
            <SegmentedControl
              value={viewType}
              onChange={(val) => setViewType(val as ViewType)}
              data={[
                { value: 'month', label: 'Month' },
                { value: 'week', label: 'Week' },
              ]}
            />
            <Select
              placeholder="Filter by group"
              data={[
                { value: 'all', label: 'All Groups' },
                ...groups.map((g) => ({ value: g.id, label: g.name })),
              ]}
              value={filterGroup}
              onChange={setFilterGroup}
              clearable={false}
              w={140}
              size="sm"
            />
          </Group>
        </Group>

        {memberGroupIds.length === 0 ? (
          <EmptyState
            icon={<IconCalendarEvent size={32} />}
            title="No groups yet"
            description="You're not a member of any training groups. Join a group using an invite code to see the schedule."
            color="blue"
          />
        ) : (
          <>
            <Group mb="lg" gap="xs">
              {viewType === 'month' && (
                <>
                  <ActionIcon variant="subtle" onClick={goToPrevMonth}>
                    <IconChevronLeft size={20} />
                  </ActionIcon>
                  <Text fw={500} w={150} ta="center">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
                  <ActionIcon variant="subtle" onClick={goToNextMonth}>
                    <IconChevronRight size={20} />
                  </ActionIcon>
                  <Button variant="light" onClick={goToToday} size="compact-sm">
                    Today
                  </Button>
                </>
              )}
              {viewType === 'week' && (
                <>
                  <ActionIcon variant="subtle" onClick={goToPrevWeek}>
                    <IconChevronLeft size={20} />
                  </ActionIcon>
                  <Text fw={500} ta="center" style={{ minWidth: 140 }}>
                    {formatWeekRange()}
                  </Text>
                  <ActionIcon variant="subtle" onClick={goToNextWeek}>
                    <IconChevronRight size={20} />
                  </ActionIcon>
                  <Button variant="light" onClick={goToToday} size="compact-sm">
                    Today
                  </Button>
                </>
              )}
            </Group>

            {/* My Groups */}
            <Group gap="xs" mb="lg">
              <Text size="sm" c="dimmed">
                My groups:
              </Text>
              {groups.map((g) => (
                <Badge key={g.id} color={g.color || 'blue'} variant="light">
                  {g.name}
                </Badge>
              ))}
            </Group>

            {viewType === 'month' ? (
              <Card withBorder p={0}>
                {/* Calendar Header */}
                <SimpleGrid cols={7} spacing={0}>
                  {WEEKDAYS.map((day) => (
                    <Box
                      key={day}
                      p="xs"
                      ta="center"
                      style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
                    >
                      <Text size="sm" fw={500} c="dimmed">
                        {day}
                      </Text>
                    </Box>
                  ))}
                </SimpleGrid>

                {/* Calendar Grid */}
                <SimpleGrid cols={7} spacing={0}>
                  {calendarDays.map(({ date, isCurrentMonth }, idx) => {
                    const dayKey = date.toDateString();
                    const daySessions = sessionsByDate.get(dayKey) || [];
                    const scheduledSessions = daySessions.filter((s) => s.status === 'scheduled');

                    return (
                      <Box
                        key={idx}
                        p="xs"
                        mih={100}
                        style={{
                          borderBottom: '1px solid var(--mantine-color-default-border)',
                          borderRight:
                            idx % 7 !== 6 ? '1px solid var(--mantine-color-default-border)' : undefined,
                          backgroundColor: isToday(date)
                            ? 'var(--mantine-color-blue-light)'
                            : isCurrentMonth
                              ? undefined
                              : 'var(--mantine-color-default-hover)',
                        }}
                      >
                        <Text
                          size="sm"
                          fw={isToday(date) ? 700 : 400}
                          c={isCurrentMonth ? undefined : 'dimmed'}
                          mb={4}
                        >
                          {date.getDate()}
                        </Text>
                        <Stack gap={2}>
                          {scheduledSessions.slice(0, 3).map((session) => (
                            <Tooltip
                              key={session.id}
                              label={`${session.title} - ${getGroupName(session.groupId)} (${formatTimeShort(session)})`}
                              position="top"
                            >
                              <Box
                                style={{
                                  backgroundColor: `var(--mantine-color-${getGroupColor(session.groupId)}-light)`,
                                  borderLeft: `3px solid var(--mantine-color-${getGroupColor(session.groupId)}-6)`,
                                  padding: '2px 4px',
                                  borderRadius: 4,
                                  overflow: 'hidden',
                                }}
                              >
                                <Text size="xs" lineClamp={1} c={`${getGroupColor(session.groupId)}.9`}>
                                  {formatTimeShort(session)} {session.title}
                                </Text>
                              </Box>
                            </Tooltip>
                          ))}
                          {scheduledSessions.length > 3 && (
                            <Text size="xs" c="dimmed">
                              +{scheduledSessions.length - 3} more
                            </Text>
                          )}
                        </Stack>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              </Card>
            ) : (
              <Stack gap="xs">
                {getWeekDays().map((date, idx) => {
                  const dayKey = date.toDateString();
                  const daySessions = sessionsByDate.get(dayKey) || [];
                  const scheduledSessions = daySessions.filter((s) => s.status === 'scheduled');

                  return (
                    <Card
                      key={idx}
                      withBorder
                      p="sm"
                      style={{
                        backgroundColor: isToday(date) ? 'var(--mantine-color-blue-light)' : undefined,
                      }}
                    >
                      <Group wrap="nowrap" align="flex-start">
                        <Box style={{ flex: 1 }}>
                          <Group gap="xs">
                            <Text size="sm" fw={600} c={isToday(date) ? 'blue' : undefined}>
                              {WEEKDAYS_FULL[idx]}
                            </Text>
                            <Text size="sm" c="dimmed">
                              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </Text>
                          </Group>
                          {isToday(date) && (
                            <Badge size="xs" color="blue" mt={4}>Today</Badge>
                          )}
                          {scheduledSessions.length > 0 && (
                            <Badge size="xs" variant="light" mt={4}>
                              {scheduledSessions.length} session{scheduledSessions.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </Box>
                        <Divider orientation="vertical" />
                        <Box style={{ flex: 1 }}>
                          {scheduledSessions.length > 0 ? (
                            <Stack gap={4}>
                              {scheduledSessions.map((session) => (
                                <Group
                                  key={session.id}
                                  justify="space-between"
                                  wrap="nowrap"
                                  py={4}
                                >
                                  <Text size="sm">{session.title}</Text>
                                  <Text size="sm" c="dimmed">{formatTimeShort(session)}</Text>
                                </Group>
                              ))}
                            </Stack>
                          ) : (
                            <Text size="sm" c="dimmed">No sessions</Text>
                          )}
                        </Box>
                      </Group>
                    </Card>
                  );
                })}
              </Stack>
            )}

            {/* Upcoming Sessions List */}
            <Card withBorder mt="xl">
              <Title order={4} mb="md">
                Upcoming Sessions
              </Title>
              {filteredSessions.filter((s) => {
                const sessionDate = s.date?.seconds ? new Date(s.date.seconds * 1000) : null;
                return sessionDate && sessionDate >= new Date() && s.status === 'scheduled';
              }).length === 0 ? (
                <Text c="dimmed" ta="center" py="md">
                  No upcoming sessions scheduled.
                </Text>
              ) : (
                <Stack gap="sm">
                  {filteredSessions
                    .filter((s) => {
                      const sessionDate = s.date?.seconds ? new Date(s.date.seconds * 1000) : null;
                      return sessionDate && sessionDate >= new Date() && s.status === 'scheduled';
                    })
                    .slice(0, 5)
                    .map((session) => {
                      const sessionDate = session.date?.seconds
                        ? new Date(session.date.seconds * 1000)
                        : null;
                      return (
                        <Group key={session.id} justify="space-between">
                          <div>
                            <Text fw={500}>{session.title}</Text>
                            <Text size="sm" c="dimmed">
                              {getGroupName(session.groupId)} -{' '}
                              {sessionDate?.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric',
                              })}{' '}
                              at {formatTimeShort(session)}
                            </Text>
                          </div>
                          <Badge color={getStatusColor(session.status)}>{session.status}</Badge>
                        </Group>
                      );
                    })}
                </Stack>
              )}
            </Card>
          </>
        )}
      </Container>
    </AuthGuard>
  );
}
