'use client';

import { Container, Title, Text, Card, Button, Group, Table, Badge } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

export default function AdminCoachesPage() {
  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Coaches</Title>
          <Text c="dimmed">Manage coach accounts</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />}>Add Coach</Button>
      </Group>

      <Card withBorder>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Clubs</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>Coach Smith</Table.Td>
              <Table.Td>coach@dojodash.dev</Table.Td>
              <Table.Td>Demo Dojo</Table.Td>
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
