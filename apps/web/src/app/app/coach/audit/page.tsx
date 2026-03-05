'use client';

import { Container, Title, Text, Card, Table, Badge, Select, Group } from '@mantine/core';

export default function CoachAuditPage() {
  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xs">Audit Log</Title>
      <Text c="dimmed" mb="xl">Activity history for your club</Text>

      <Group mb="lg">
        <Select
          placeholder="Filter by action"
          data={['All', 'attendance.marked', 'medal.awarded', 'session.created']}
          defaultValue="All"
        />
      </Group>

      <Card withBorder>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Timestamp</Table.Th>
              <Table.Th>Action</Table.Th>
              <Table.Th>Details</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>Today</Table.Td>
              <Table.Td><Badge>session.created</Badge></Table.Td>
              <Table.Td>Weekly Training session scheduled</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Today</Table.Td>
              <Table.Td><Badge color="green">member.joined</Badge></Table.Td>
              <Table.Td>Jamie Jones joined Beginners</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Card>
    </Container>
  );
}
