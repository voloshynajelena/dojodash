'use client';

import { Container, Title, Text, Card, Table, Badge, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

export default function AdminUsersPage() {
  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xs">Users</Title>
      <Text c="dimmed" mb="xl">View all families and children</Text>

      <TextInput
        placeholder="Search users..."
        leftSection={<IconSearch size={16} />}
        mb="lg"
      />

      <Card withBorder>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Children</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>Parent Jones</Table.Td>
              <Table.Td>family@dojodash.dev</Table.Td>
              <Table.Td><Badge>Family</Badge></Table.Td>
              <Table.Td>1</Table.Td>
              <Table.Td><Badge color="green">Active</Badge></Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Card>
    </Container>
  );
}
