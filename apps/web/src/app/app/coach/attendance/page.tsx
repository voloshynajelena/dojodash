'use client';

import { Container, Title, Text, Card, Button, Group, Table, Select, Badge, ActionIcon } from '@mantine/core';
import { IconCheck, IconX, IconClock } from '@tabler/icons-react';

export default function CoachAttendancePage() {
  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xs">Attendance</Title>
      <Text c="dimmed" mb="xl">Mark attendance for training sessions</Text>

      <Group mb="lg">
        <Select
          label="Session"
          placeholder="Select session"
          data={['Weekly Training - Next Monday']}
          defaultValue="Weekly Training - Next Monday"
        />
      </Group>

      <Card withBorder>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Student</Table.Th>
              <Table.Th>Group</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>Jamie Jones</Table.Td>
              <Table.Td>Beginners</Table.Td>
              <Table.Td><Badge color="gray">Not marked</Badge></Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon color="green" variant="light">
                    <IconCheck size={16} />
                  </ActionIcon>
                  <ActionIcon color="yellow" variant="light">
                    <IconClock size={16} />
                  </ActionIcon>
                  <ActionIcon color="red" variant="light">
                    <IconX size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>

        <Group justify="flex-end" mt="md">
          <Button>Save Attendance</Button>
        </Group>
      </Card>
    </Container>
  );
}
