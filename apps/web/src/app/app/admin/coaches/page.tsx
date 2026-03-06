'use client';

import { useState, useEffect } from 'react';
import {
  Container, Title, Text, Card, Button, Group, Table, Badge, Modal,
  TextInput, Stack, Loader, Center, Select
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { getCoaches, createUser, updateUser, getAllClubs } from '@dojodash/firebase';
import type { User, Club } from '@dojodash/core';

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<User[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCoach, setEditingCoach] = useState<User | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      email: '',
      displayName: '',
      clubIds: [] as string[],
    },
    validate: {
      email: (value) => (!value ? 'Email is required' : null),
      displayName: (value) => (!value ? 'Name is required' : null),
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coachesData, clubsData] = await Promise.all([
        getCoaches(),
        getAllClubs(),
      ]);
      setCoaches(coachesData);
      setClubs(clubsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCoach(null);
    form.reset();
    open();
  };

  const handleOpenEdit = (coach: User) => {
    setEditingCoach(coach);
    form.setValues({
      email: coach.email,
      displayName: coach.displayName || '',
      clubIds: coach.clubIds || [],
    });
    open();
  };

  const handleSave = async (values: typeof form.values) => {
    try {
      setSaving(true);

      if (editingCoach) {
        await updateUser(editingCoach.uid, {
          displayName: values.displayName,
          clubIds: values.clubIds,
        });
        notifications.show({
          title: 'Success',
          message: 'Coach updated successfully',
          color: 'green',
        });
      } else {
        // For new coach, we create a placeholder user record
        // In production, this would trigger an invite email
        const uid = `coach-${Date.now()}`;
        await createUser({
          uid,
          email: values.email,
          displayName: values.displayName,
          role: 'COACH',
          clubIds: values.clubIds,
          disabled: false,
        });
        notifications.show({
          title: 'Success',
          message: 'Coach added successfully',
          color: 'green',
        });
      }

      await loadData();
      close();
      form.reset();
      setEditingCoach(null);
    } catch (error) {
      console.error('Failed to save coach:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save coach',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const getClubNames = (clubIds?: string[]) => {
    if (!clubIds || clubIds.length === 0) return '-';
    return clubIds
      .map((id) => clubs.find((c) => c.id === id)?.name || id)
      .join(', ');
  };

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Center h={300}>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Coaches</Title>
          <Text c="dimmed">Manage coach accounts</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={handleOpenAdd}>
          Add Coach
        </Button>
      </Group>

      <Card withBorder>
        {coaches.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No coaches yet. Add your first coach to get started.
          </Text>
        ) : (
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
              {coaches.map((coach) => (
                <Table.Tr key={coach.uid}>
                  <Table.Td>{coach.displayName || '-'}</Table.Td>
                  <Table.Td>{coach.email}</Table.Td>
                  <Table.Td>{getClubNames(coach.clubIds)}</Table.Td>
                  <Table.Td>
                    <Badge color={coach.disabled ? 'red' : 'green'}>
                      {coach.disabled ? 'Disabled' : 'Active'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Button
                      variant="subtle"
                      size="xs"
                      onClick={() => handleOpenEdit(coach)}
                    >
                      Edit
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      <Modal
        opened={opened}
        onClose={() => {
          close();
          setEditingCoach(null);
        }}
        title={editingCoach ? 'Edit Coach' : 'Add Coach'}
      >
        <form onSubmit={form.onSubmit(handleSave)}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="coach@example.com"
              required
              disabled={!!editingCoach}
              {...form.getInputProps('email')}
            />
            <TextInput
              label="Name"
              placeholder="Coach name"
              required
              {...form.getInputProps('displayName')}
            />
            <Select
              label="Assigned Club"
              placeholder="Select a club"
              data={clubs.map((c) => ({ value: c.id, label: c.name }))}
              value={form.values.clubIds[0] || null}
              onChange={(value) =>
                form.setFieldValue('clubIds', value ? [value] : [])
              }
            />
            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                onClick={() => {
                  close();
                  setEditingCoach(null);
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {editingCoach ? 'Save Changes' : 'Add Coach'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
