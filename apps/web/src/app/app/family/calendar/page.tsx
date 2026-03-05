'use client';

import { Container, Title, Text, Card, SimpleGrid, Badge, Group, Stack } from '@mantine/core';
import { IconCheck, IconX, IconMinus } from '@tabler/icons-react';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const attendance = [
  { day: 'Mon', status: 'present' },
  { day: 'Tue', status: null },
  { day: 'Wed', status: 'present' },
  { day: 'Thu', status: null },
  { day: 'Fri', status: 'absent' },
  { day: 'Sat', status: null },
  { day: 'Sun', status: null },
];

export default function FamilyCalendarPage() {
  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xs">Attendance Calendar</Title>
      <Text c="dimmed" mb="xl">Track your child's training attendance</Text>

      <Card withBorder p="lg" mb="xl">
        <Title order={4} mb="md">This Week</Title>
        <SimpleGrid cols={7}>
          {attendance.map((item) => (
            <Card
              key={item.day}
              withBorder
              p="md"
              ta="center"
              bg={
                item.status === 'present' ? 'green.0' :
                item.status === 'absent' ? 'red.0' :
                undefined
              }
            >
              <Text size="sm" c="dimmed" mb="xs">{item.day}</Text>
              {item.status === 'present' && <IconCheck size={24} color="green" />}
              {item.status === 'absent' && <IconX size={24} color="red" />}
              {!item.status && <IconMinus size={24} color="gray" />}
            </Card>
          ))}
        </SimpleGrid>
      </Card>

      <SimpleGrid cols={{ base: 1, md: 3 }}>
        <Card withBorder p="lg" ta="center">
          <Text size="xl" fw={700} c="green">12</Text>
          <Text size="sm" c="dimmed">Sessions Attended</Text>
        </Card>
        <Card withBorder p="lg" ta="center">
          <Text size="xl" fw={700} c="red">3</Text>
          <Text size="sm" c="dimmed">Sessions Missed</Text>
        </Card>
        <Card withBorder p="lg" ta="center">
          <Text size="xl" fw={700} c="blue">80%</Text>
          <Text size="sm" c="dimmed">Attendance Rate</Text>
        </Card>
      </SimpleGrid>

      <Card withBorder p="lg" mt="xl">
        <Title order={4} mb="md">Upcoming Sessions</Title>
        <Stack gap="sm">
          <Group justify="space-between">
            <div>
              <Text fw={500}>Weekly Training</Text>
              <Text size="sm" c="dimmed">Beginners - Next Monday 4:00 PM</Text>
            </div>
            <Badge>Scheduled</Badge>
          </Group>
        </Stack>
      </Card>
    </Container>
  );
}
