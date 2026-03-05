'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Container, Title, Text, Card, Button, Group, Table, Badge, Select,
  Modal, TextInput, Stack, Loader, Center, Chip, NumberInput, Radio,
  Divider, Paper, SegmentedControl, ActionIcon, SimpleGrid, Box, Tooltip
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconCalendarRepeat, IconList, IconCalendar, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import {
  getSessions, createSession, createSessionsBatch, updateSession, getGroups
} from '@dojodash/firebase';
import type { Session, Group as GroupType } from '@dojodash/core';

const DAYS = [
  { value: '1', label: 'M', fullLabel: 'Monday' },
  { value: '2', label: 'T', fullLabel: 'Tuesday' },
  { value: '3', label: 'W', fullLabel: 'Wednesday' },
  { value: '4', label: 'T', fullLabel: 'Thursday' },
  { value: '5', label: 'F', fullLabel: 'Friday' },
  { value: '6', label: 'S', fullLabel: 'Saturday' },
  { value: '0', label: 'S', fullLabel: 'Sunday' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type EndType = 'never' | 'on' | 'after';
type ViewType = 'month' | 'week' | 'list';

// Helper to get start of week (Sunday)
const getWeekStart = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};

export default function CoachSchedulePage() {
  const { claims } = useAuth();
  const clubId = 'demo-club';

  const [sessions, setSessions] = useState<Session[]>([]);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState<string | null>('all');
  const [filterStatus, setFilterStatus] = useState<string | null>('all');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [creating, setCreating] = useState(false);
  const [viewType, setViewType] = useState<ViewType>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(getWeekStart(new Date()));

  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // Recurrence state
  const [selectedDays, setSelectedDays] = useState<string[]>(['1']); // Monday default
  const [repeatEvery, setRepeatEvery] = useState<number>(1);
  const [endType, setEndType] = useState<EndType>('never');
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [endAfterOccurrences, setEndAfterOccurrences] = useState<number>(13);

  const addForm = useForm({
    initialValues: {
      title: '',
      groupId: '',
      startDate: new Date(),
      startTime: '16:00',
      endTime: '17:00',
    },
  });

  const editForm = useForm({
    initialValues: {
      title: '',
      date: new Date(),
      startTime: '16:00',
      endTime: '17:00',
      status: 'scheduled',
    },
  });

  useEffect(() => {
    loadData();
  }, [clubId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessionsData, groupsData] = await Promise.all([
        getSessions(clubId),
        getGroups(clubId),
      ]);
      setSessions(sessionsData);
      setGroups(groupsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load sessions',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetRecurrenceState = () => {
    setSelectedDays(['1']);
    setRepeatEvery(1);
    setEndType('never');
    setEndDate(null);
    setEndAfterOccurrences(13);
  };

  const generateSessionDates = (): Date[] => {
    const dates: Date[] = [];
    const startDate = addForm.values.startDate;
    const daysOfWeek = selectedDays.map(d => parseInt(d));

    let maxDate: Date | null = null;
    let maxOccurrences = Infinity;

    if (endType === 'on' && endDate) {
      maxDate = endDate;
    } else if (endType === 'after') {
      maxOccurrences = endAfterOccurrences;
    } else {
      maxDate = new Date(startDate);
      maxDate.setMonth(maxDate.getMonth() + 12);
    }

    let currentDate = new Date(startDate);
    let occurrenceCount = 0;

    while (occurrenceCount < maxOccurrences && (!maxDate || currentDate <= maxDate)) {
      const dayOfWeek = currentDate.getDay();

      if (daysOfWeek.includes(dayOfWeek)) {
        const weeksSinceStart = Math.floor(
          (currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
        );

        if (weeksSinceStart % repeatEvery === 0) {
          dates.push(new Date(currentDate));
          occurrenceCount++;
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
      if (dates.length > 200) break;
    }

    return dates;
  };

  const handleAddSession = async (values: typeof addForm.values) => {
    if (selectedDays.length === 0) {
      notifications.show({
        title: 'Error',
        message: 'Please select at least one day',
        color: 'red',
      });
      return;
    }

    try {
      setCreating(true);
      const startParts = values.startTime.split(':').map(Number);
      const endParts = values.endTime.split(':').map(Number);
      const startHour = startParts[0] ?? 16;
      const startMinute = startParts[1] ?? 0;
      const endHour = endParts[0] ?? 17;
      const endMinute = endParts[1] ?? 0;

      const sessionDates = generateSessionDates();

      if (sessionDates.length === 0) {
        notifications.show({
          title: 'Error',
          message: 'No sessions would be created with these settings',
          color: 'red',
        });
        return;
      }

      const sessionsToCreate = sessionDates.map(date => ({
        title: values.title,
        groupId: values.groupId,
        date: {
          seconds: Math.floor(date.getTime() / 1000),
          nanoseconds: 0,
        },
        startTime: { hour: startHour, minute: startMinute },
        endTime: { hour: endHour, minute: endMinute },
      }));

      await createSessionsBatch(clubId, sessionsToCreate);

      notifications.show({
        title: 'Success',
        message: `Created ${sessionDates.length} session${sessionDates.length > 1 ? 's' : ''}`,
        color: 'green',
      });

      addForm.reset();
      resetRecurrenceState();
      closeAdd();
      loadData();
    } catch (error) {
      console.error('Failed to create sessions:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create sessions',
        color: 'red',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleEditSession = (session: Session) => {
    setSelectedSession(session);

    const sessionDate = session.date?.seconds
      ? new Date(session.date.seconds * 1000)
      : new Date();

    editForm.setValues({
      title: session.title,
      date: sessionDate,
      startTime: `${String(session.startTime?.hour ?? 16).padStart(2, '0')}:${String(session.startTime?.minute ?? 0).padStart(2, '0')}`,
      endTime: `${String(session.endTime?.hour ?? 17).padStart(2, '0')}:${String(session.endTime?.minute ?? 0).padStart(2, '0')}`,
      status: session.status,
    });
    openEdit();
  };

  const handleUpdateSession = async (values: typeof editForm.values) => {
    if (!selectedSession) return;

    try {
      const startParts = values.startTime.split(':').map(Number);
      const endParts = values.endTime.split(':').map(Number);
      const startHour = startParts[0] ?? 16;
      const startMinute = startParts[1] ?? 0;
      const endHour = endParts[0] ?? 17;
      const endMinute = endParts[1] ?? 0;

      await updateSession(clubId, selectedSession.id, {
        title: values.title,
        date: {
          seconds: Math.floor(values.date.getTime() / 1000),
          nanoseconds: 0,
        },
        startTime: { hour: startHour, minute: startMinute },
        endTime: { hour: endHour, minute: endMinute },
        status: values.status as Session['status'],
      });

      notifications.show({
        title: 'Success',
        message: 'Session updated successfully',
        color: 'green',
      });

      closeEdit();
      loadData();
    } catch (error) {
      console.error('Failed to update session:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update session',
        color: 'red',
      });
    }
  };

  const handleCancelSession = async (session: Session) => {
    try {
      await updateSession(clubId, session.id, {
        status: 'cancelled',
      });

      notifications.show({
        title: 'Success',
        message: 'Session cancelled',
        color: 'green',
      });

      loadData();
    } catch (error) {
      console.error('Failed to cancel session:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to cancel session',
        color: 'red',
      });
    }
  };

  const formatDate = (session: Session) => {
    if (!session.date?.seconds) return 'No date';
    const date = new Date(session.date.seconds * 1000);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    const dayDiff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (dayDiff > 0 && dayDiff <= 7) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (session: Session) => {
    const start = session.startTime
      ? `${session.startTime.hour}:${String(session.startTime.minute).padStart(2, '0')}`
      : '?';
    const end = session.endTime
      ? `${session.endTime.hour}:${String(session.endTime.minute).padStart(2, '0')}`
      : '?';
    return `${start} - ${end}`;
  };

  const formatTimeShort = (session: Session) => {
    if (!session.startTime) return '';
    return `${session.startTime.hour}:${String(session.startTime.minute).padStart(2, '0')}`;
  };

  const getGroupName = (groupId: string) => {
    return groups.find(g => g.id === groupId)?.name ?? 'Unknown';
  };

  const getGroupColor = (groupId: string) => {
    return groups.find(g => g.id === groupId)?.color ?? 'blue';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'blue';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filterGroup !== 'all' && session.groupId !== filterGroup) return false;
    if (filterStatus !== 'all' && session.status !== filterStatus) return false;
    return true;
  });

  const previewCount = selectedDays.length > 0 ? generateSessionDates().length : 0;

  // Calendar helpers
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
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
    filteredSessions.forEach(session => {
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
      <Container size="lg" py="xl">
        <Center h={300}>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Schedule</Title>
          <Text c="dimmed">Manage training sessions</Text>
        </div>
        <Group>
          <SegmentedControl
            value={viewType}
            onChange={(val) => setViewType(val as ViewType)}
            data={[
              { value: 'month', label: 'Month' },
              { value: 'week', label: 'Week' },
              { value: 'list', label: 'List' },
            ]}
          />
          <Button leftSection={<IconPlus size={16} />} onClick={openAdd}>
            Add Session
          </Button>
        </Group>
      </Group>

      <Group mb="lg">
        <Select
          placeholder="Filter by group"
          data={[
            { value: 'all', label: 'All Groups' },
            ...groups.map(g => ({ value: g.id, label: g.name })),
          ]}
          value={filterGroup}
          onChange={setFilterGroup}
          clearable={false}
          w={160}
        />
        {viewType === 'list' && (
          <Select
            placeholder="Status"
            data={[
              { value: 'all', label: 'All' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            value={filterStatus}
            onChange={setFilterStatus}
            clearable={false}
          />
        )}
        {viewType === 'month' && (
          <>
            <ActionIcon variant="subtle" onClick={goToPrevMonth}>
              <IconChevronLeft size={20} />
            </ActionIcon>
            <Button variant="subtle" onClick={goToToday} size="compact-sm">
              Today
            </Button>
            <Text fw={500} w={150} ta="center">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <ActionIcon variant="subtle" onClick={goToNextMonth}>
              <IconChevronRight size={20} />
            </ActionIcon>
          </>
        )}
        {viewType === 'week' && (
          <>
            <ActionIcon variant="subtle" onClick={goToPrevWeek}>
              <IconChevronLeft size={20} />
            </ActionIcon>
            <Button variant="subtle" onClick={goToToday} size="compact-sm">
              Today
            </Button>
            <Text fw={500} w={200} ta="center">
              {formatWeekRange()}
            </Text>
            <ActionIcon variant="subtle" onClick={goToNextWeek}>
              <IconChevronRight size={20} />
            </ActionIcon>
          </>
        )}
      </Group>

      {viewType === 'month' ? (
        <Card withBorder p={0}>
          {/* Calendar Header */}
          <SimpleGrid cols={7} spacing={0}>
            {WEEKDAYS.map(day => (
              <Box key={day} p="xs" ta="center" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                <Text size="sm" fw={500} c="dimmed">{day}</Text>
              </Box>
            ))}
          </SimpleGrid>

          {/* Calendar Grid */}
          <SimpleGrid cols={7} spacing={0}>
            {calendarDays.map(({ date, isCurrentMonth }, idx) => {
              const dayKey = date.toDateString();
              const daySessions = sessionsByDate.get(dayKey) || [];
              const scheduledSessions = daySessions.filter(s => s.status === 'scheduled');

              return (
                <Box
                  key={idx}
                  p="xs"
                  mih={100}
                  style={{
                    borderBottom: '1px solid var(--mantine-color-gray-2)',
                    borderRight: idx % 7 !== 6 ? '1px solid var(--mantine-color-gray-2)' : undefined,
                    backgroundColor: isToday(date) ? 'var(--mantine-color-blue-0)' : isCurrentMonth ? undefined : 'var(--mantine-color-gray-0)',
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
                    {scheduledSessions.slice(0, 3).map(session => (
                      <Tooltip
                        key={session.id}
                        label={`${session.title} - ${getGroupName(session.groupId)} (${formatTimeShort(session)})`}
                        position="top"
                      >
                        <Box
                          onClick={() => handleEditSession(session)}
                          style={{
                            backgroundColor: `var(--mantine-color-${getGroupColor(session.groupId)}-1)`,
                            borderLeft: `3px solid var(--mantine-color-${getGroupColor(session.groupId)}-5)`,
                            padding: '2px 4px',
                            borderRadius: 4,
                            cursor: 'pointer',
                            overflow: 'hidden',
                          }}
                        >
                          <Text size="xs" lineClamp={1}>
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
      ) : viewType === 'week' ? (
        <Card withBorder p={0}>
          {/* Week View Header */}
          <SimpleGrid cols={7} spacing={0}>
            {getWeekDays().map((date, idx) => (
              <Box
                key={idx}
                p="xs"
                ta="center"
                style={{
                  borderBottom: '1px solid var(--mantine-color-gray-3)',
                  backgroundColor: isToday(date) ? 'var(--mantine-color-blue-0)' : undefined,
                }}
              >
                <Text size="xs" c="dimmed">{WEEKDAYS[date.getDay()]}</Text>
                <Text size="lg" fw={isToday(date) ? 700 : 500}>{date.getDate()}</Text>
              </Box>
            ))}
          </SimpleGrid>

          {/* Week View Grid */}
          <SimpleGrid cols={7} spacing={0}>
            {getWeekDays().map((date, idx) => {
              const dayKey = date.toDateString();
              const daySessions = sessionsByDate.get(dayKey) || [];
              const scheduledSessions = daySessions.filter(s => s.status === 'scheduled');

              return (
                <Box
                  key={idx}
                  p="xs"
                  mih={300}
                  style={{
                    borderRight: idx !== 6 ? '1px solid var(--mantine-color-gray-2)' : undefined,
                    backgroundColor: isToday(date) ? 'var(--mantine-color-blue-0)' : undefined,
                  }}
                >
                  <Stack gap={4}>
                    {scheduledSessions.map(session => (
                      <Box
                        key={session.id}
                        onClick={() => handleEditSession(session)}
                        style={{
                          backgroundColor: `var(--mantine-color-${getGroupColor(session.groupId)}-1)`,
                          borderLeft: `3px solid var(--mantine-color-${getGroupColor(session.groupId)}-5)`,
                          padding: '6px 8px',
                          borderRadius: 4,
                          cursor: 'pointer',
                        }}
                      >
                        <Text size="xs" fw={500}>{formatTimeShort(session)}</Text>
                        <Text size="sm" lineClamp={1}>{session.title}</Text>
                        <Text size="xs" c="dimmed">{getGroupName(session.groupId)}</Text>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              );
            })}
          </SimpleGrid>
        </Card>
      ) : (
        <Card withBorder>
          {filteredSessions.length === 0 ? (
            <Text ta="center" py="xl" c="dimmed">
              No sessions found. Create your first session to get started.
            </Text>
          ) : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Time</Table.Th>
                  <Table.Th>Group</Table.Th>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredSessions.map((session) => (
                  <Table.Tr key={session.id}>
                    <Table.Td>{formatDate(session)}</Table.Td>
                    <Table.Td>{formatTime(session)}</Table.Td>
                    <Table.Td>{getGroupName(session.groupId)}</Table.Td>
                    <Table.Td>{session.title}</Table.Td>
                    <Table.Td>
                      <Badge color={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button
                          variant="subtle"
                          size="xs"
                          onClick={() => handleEditSession(session)}
                        >
                          Edit
                        </Button>
                        {session.status === 'scheduled' && (
                          <Button
                            variant="subtle"
                            size="xs"
                            color="red"
                            onClick={() => handleCancelSession(session)}
                          >
                            Cancel
                          </Button>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Card>
      )}

      {/* Add Session Modal */}
      <Modal opened={addOpened} onClose={closeAdd} title="Add Session" size="md">
        <form onSubmit={addForm.onSubmit(handleAddSession)}>
          <Stack>
            <TextInput
              label="Session Title"
              placeholder="e.g., Weekly Training"
              required
              {...addForm.getInputProps('title')}
            />
            <Select
              label="Group"
              placeholder="Select a group"
              data={groups.map(g => ({ value: g.id, label: g.name }))}
              required
              {...addForm.getInputProps('groupId')}
            />

            <Divider label="Schedule" labelPosition="center" />

            <DateInput
              label="Start Date"
              placeholder="Select start date"
              required
              minDate={new Date()}
              {...addForm.getInputProps('startDate')}
            />

            <Group grow>
              <TextInput
                label="Start Time"
                type="time"
                required
                {...addForm.getInputProps('startTime')}
              />
              <TextInput
                label="End Time"
                type="time"
                required
                {...addForm.getInputProps('endTime')}
              />
            </Group>

            <Divider label="Repeat" labelPosition="center" />

            <Paper p="md" withBorder>
              <Stack gap="md">
                <Group>
                  <Text size="sm">Repeat every</Text>
                  <NumberInput
                    value={repeatEvery}
                    onChange={(val) => setRepeatEvery(typeof val === 'number' ? val : 1)}
                    min={1}
                    max={12}
                    w={70}
                    size="sm"
                  />
                  <Text size="sm">week(s)</Text>
                </Group>

                <div>
                  <Text size="sm" mb="xs">Repeat on</Text>
                  <Group gap="xs">
                    {DAYS.map((day) => (
                      <Chip
                        key={day.value}
                        checked={selectedDays.includes(day.value)}
                        onChange={() => {
                          if (selectedDays.includes(day.value)) {
                            setSelectedDays(selectedDays.filter(d => d !== day.value));
                          } else {
                            setSelectedDays([...selectedDays, day.value]);
                          }
                        }}
                        size="md"
                        radius="xl"
                      >
                        {day.label}
                      </Chip>
                    ))}
                  </Group>
                </div>

                <div>
                  <Text size="sm" mb="xs">Ends</Text>
                  <Radio.Group value={endType} onChange={(val) => setEndType(val as EndType)}>
                    <Stack gap="sm">
                      <Radio value="never" label="Never (12 months)" />
                      <Group>
                        <Radio value="on" label="On" />
                        <DateInput
                          placeholder="Select date"
                          value={endDate}
                          onChange={setEndDate}
                          minDate={addForm.values.startDate}
                          disabled={endType !== 'on'}
                          size="sm"
                          w={150}
                        />
                      </Group>
                      <Group>
                        <Radio value="after" label="After" />
                        <NumberInput
                          value={endAfterOccurrences}
                          onChange={(val) => setEndAfterOccurrences(typeof val === 'number' ? val : 13)}
                          min={1}
                          max={100}
                          disabled={endType !== 'after'}
                          size="sm"
                          w={70}
                        />
                        <Text size="sm" c={endType !== 'after' ? 'dimmed' : undefined}>occurrences</Text>
                      </Group>
                    </Stack>
                  </Radio.Group>
                </div>

                {previewCount > 0 && (
                  <Group gap="xs">
                    <IconCalendarRepeat size={16} />
                    <Text size="sm" c="dimmed">
                      Will create {previewCount} session{previewCount > 1 ? 's' : ''}
                    </Text>
                  </Group>
                )}
              </Stack>
            </Paper>

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={closeAdd}>Cancel</Button>
              <Button type="submit" loading={creating}>
                Add Session{previewCount > 1 ? `s (${previewCount})` : ''}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Session Modal */}
      <Modal opened={editOpened} onClose={closeEdit} title="Edit Session" size="md">
        <form onSubmit={editForm.onSubmit(handleUpdateSession)}>
          <Stack>
            <TextInput
              label="Session Title"
              required
              {...editForm.getInputProps('title')}
            />
            <DateInput
              label="Date"
              required
              {...editForm.getInputProps('date')}
            />
            <Group grow>
              <TextInput
                label="Start Time"
                type="time"
                required
                {...editForm.getInputProps('startTime')}
              />
              <TextInput
                label="End Time"
                type="time"
                required
                {...editForm.getInputProps('endTime')}
              />
            </Group>
            <Select
              label="Status"
              data={[
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              {...editForm.getInputProps('status')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={closeEdit}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
