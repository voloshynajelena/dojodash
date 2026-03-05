'use client';

import { Container, Title, Text, Card, Table, Badge, Select, Group } from '@mantine/core';

export default function AdminLogsPage() {
  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xs">Audit Logs</Title>
      <Text c="dimmed" mb="xl">System-wide activity logs</Text>

      <Group mb="lg">
        <Select
          placeholder="Filter by action"
          data={['All', 'user.created', 'club.created', 'attendance.marked']}
          defaultValue="All"
        />
        <Select
          placeholder="Filter by type"
          data={['All', 'user', 'club', 'session', 'attendance']}
          defaultValue="All"
        />
      </Group>

      <Card withBorder>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Timestamp</Table.Th>
              <Table.Th>Action</Table.Th>
              <Table.Th>Actor</Table.Th>
              <Table.Th>Target</Table.Th>
              <Table.Th>Details</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>Just now</Table.Td>
              <Table.Td><Badge>user.created</Badge></Table.Td>
              <Table.Td>System</Table.Td>
              <Table.Td>family@dojodash.dev</Table.Td>
              <Table.Td>New family account</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Card>
    </Container>
  );
}
