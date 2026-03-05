'use client';

import { Container, Title, Text, Card, Button, Stack, Alert } from '@mantine/core';
import { IconAlertCircle, IconDatabase, IconRefresh, IconTrash } from '@tabler/icons-react';

export default function AdminToolsPage() {
  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xs">Dev Tools</Title>
      <Text c="dimmed" mb="xl">Development utilities (emulator only)</Text>

      <Alert icon={<IconAlertCircle size={16} />} color="yellow" mb="xl">
        These tools are only available in development mode with emulators.
      </Alert>

      <Stack>
        <Card withBorder p="lg">
          <Title order={4} mb="xs">Database</Title>
          <Text size="sm" c="dimmed" mb="md">Manage emulator data</Text>
          <Button.Group>
            <Button variant="light" leftSection={<IconDatabase size={16} />}>
              Export Data
            </Button>
            <Button variant="light" leftSection={<IconRefresh size={16} />}>
              Re-seed Data
            </Button>
            <Button variant="light" color="red" leftSection={<IconTrash size={16} />}>
              Clear All
            </Button>
          </Button.Group>
        </Card>
      </Stack>
    </Container>
  );
}
