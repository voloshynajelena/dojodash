'use client';

import { useState, useEffect } from 'react';
import { Title, Text, SimpleGrid, Paper, Stack, Button, Modal, TextInput, Group, Card, Avatar, Badge } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm, zodResolver } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { IconPlus, IconUser } from '@tabler/icons-react';
import { createChildSchema } from '@dojodash/core';
import type { Child } from '@dojodash/core';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { getChildren, createChild } from '@dojodash/firebase';
import { EmptyState, LoadingState } from '@dojodash/ui';

export default function FamilyChildrenPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      nickname: '',
      dateOfBirth: new Date(),
    },
    validate: zodResolver(createChildSchema),
  });

  useEffect(() => {
    if (!user) return;

    const loadChildren = async () => {
      try {
        const data = await getChildren(user.uid);
        setChildren(data);
      } catch (error) {
        console.error('Failed to load children:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChildren();
  }, [user]);

  const handleCreateChild = async (values: typeof form.values) => {
    if (!user) return;

    try {
      await createChild(user.uid, {
        firstName: values.firstName,
        lastName: values.lastName,
        nickname: values.nickname || undefined,
        dateOfBirth: {
          seconds: Math.floor(values.dateOfBirth.getTime() / 1000),
          nanoseconds: 0,
        },
        groupIds: [],
        privacy: {
          showOnLeaderboard: true,
          showFullName: false,
          showPhoto: false,
        },
        stats: {
          totalXP: 0,
          level: 1,
          currentStreak: 0,
          longestStreak: 0,
          totalSessions: 0,
          attendedSessions: 0,
        },
      });

      const updatedChildren = await getChildren(user.uid);
      setChildren(updatedChildren);
      form.reset();
      close();
    } catch (error) {
      console.error('Failed to create child:', error);
    }
  };

  return (
    <AuthGuard allowedRoles={['FAMILY']}>
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>My Children</Title>
            <Text c="dimmed">Manage your children's profiles</Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={open}>
            Add Child
          </Button>
        </Group>

        {loading ? (
          <LoadingState message="Loading children..." />
        ) : children.length === 0 ? (
          <EmptyState
            icon={<IconUser size={32} />}
            title="No children added yet"
            description="Add your first child to start tracking their progress"
            action={{ label: 'Add Child', onClick: open }}
            color="blue"
          />
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {children.map((child) => (
              <Card key={child.id} shadow="sm" padding="lg" radius="md" withBorder>
                <Group>
                  <Avatar size="lg" radius="xl" color="blue">
                    {child.firstName[0]}
                    {child.lastName[0]}
                  </Avatar>
                  <div>
                    <Text fw={500}>
                      {child.firstName} {child.lastName}
                    </Text>
                    {child.nickname && (
                      <Text size="sm" c="dimmed">
                        "{child.nickname}"
                      </Text>
                    )}
                  </div>
                </Group>

                <Group mt="md" gap="xs">
                  <Badge color="blue" variant="light">
                    Level {child.stats.level}
                  </Badge>
                  <Badge color="green" variant="light">
                    {child.stats.totalXP} XP
                  </Badge>
                  {child.stats.currentStreak > 0 && (
                    <Badge color="orange" variant="light">
                      {child.stats.currentStreak} streak
                    </Badge>
                  )}
                </Group>

                <Text size="sm" c="dimmed" mt="md">
                  {child.groupIds.length} group{child.groupIds.length !== 1 ? 's' : ''}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        )}

        <Modal opened={opened} onClose={close} title="Add Child">
          <form onSubmit={form.onSubmit(handleCreateChild)}>
            <Stack>
              <TextInput
                label="First Name"
                placeholder="Child's first name"
                required
                {...form.getInputProps('firstName')}
              />
              <TextInput
                label="Last Name"
                placeholder="Child's last name"
                required
                {...form.getInputProps('lastName')}
              />
              <TextInput
                label="Nickname"
                placeholder="Optional nickname"
                {...form.getInputProps('nickname')}
              />
              <DateInput
                label="Date of Birth"
                placeholder="Select date"
                required
                {...form.getInputProps('dateOfBirth')}
              />
              <Group justify="flex-end" mt="md">
                <Button variant="subtle" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit">Add Child</Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </Stack>
    </AuthGuard>
  );
}
