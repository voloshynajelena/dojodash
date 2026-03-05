'use client';

import { Container, Title, Text, Card, Button, Group, Table, Badge } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

export default function AdminClubsPage() {
  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Clubs</Title>
          <Text c="dimmed">Manage all clubs in the system</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />}>Create Club</Button>
      </Group>

      <Card withBorder>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Coaches</Table.Th>
              <Table.Th>Members</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>Demo Dojo</Table.Td>
              <Table.Td>1</Table.Td>
              <Table.Td>1</Table.Td>
              <Table.Td><Badge color="green">Active</Badge></Table.Td>
              <Table.Td>
                <Button variant="subtle" size="xs">Edit</Button>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Card>
    </Container>
  );
}
