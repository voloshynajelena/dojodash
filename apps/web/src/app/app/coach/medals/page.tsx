'use client';

import { Container, Title, Text, Card, Button, Group, SimpleGrid, Badge, Stack, Tabs } from '@mantine/core';
import { IconPlus, IconTrophy, IconGift } from '@tabler/icons-react';

export default function CoachMedalsPage() {
  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Medals</Title>
          <Text c="dimmed">Manage medal templates and awards</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />}>Create Template</Button>
      </Group>

      <Tabs defaultValue="templates">
        <Tabs.List mb="lg">
          <Tabs.Tab value="templates" leftSection={<IconTrophy size={16} />}>
            Templates
          </Tabs.Tab>
          <Tabs.Tab value="award" leftSection={<IconGift size={16} />}>
            Award Medal
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="templates">
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
            <Card withBorder p="lg" style={{ borderLeft: '4px solid #FFD700' }}>
              <Group justify="space-between" mb="sm">
                <Text fw={500}>Star Performer</Text>
                <Badge color="yellow">25 XP</Badge>
              </Group>
              <Text size="sm" c="dimmed" mb="md">For outstanding effort in class</Text>
              <Badge>Spirit</Badge>
            </Card>

            <Card withBorder p="lg" style={{ borderLeft: '4px solid #3B82F6' }}>
              <Group justify="space-between" mb="sm">
                <Text fw={500}>Skill Master</Text>
                <Badge color="blue">50 XP</Badge>
              </Group>
              <Text size="sm" c="dimmed" mb="md">Mastered a new technique</Text>
              <Badge>Skill</Badge>
            </Card>
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="award">
          <Card withBorder p="lg">
            <Stack>
              <Text>Select a medal template and students to award.</Text>
              <Button>Award Medals</Button>
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
