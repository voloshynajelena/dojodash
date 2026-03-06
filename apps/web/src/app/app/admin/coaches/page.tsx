'use client';

import { useState, useEffect } from 'react';
import {
  Container, Title, Text, Card, Button, Group, Table, Badge, Modal,
  TextInput, PasswordInput, Stack, Loader, Center, MultiSelect
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { getCoaches, updateUser, getAllClubs, adminCreateCoach, adminDeleteUser } from '@dojodash/firebase';
import type { User, Club } from '@dojodash/core';

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<User[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingCoach, setEditingCoach] = useState<User | null>(null);
  const [deletingCoach, setDeletingCoach] = useState<User | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      email: '',
      displayName: '',
      password: '',
      clubIds: [] as string[],
    },
    validate: {
      email: (value) => (!value ? 'Email is required' : null),
      displayName: (value) => (!value ? 'Name is required' : null),
      password: (value, values) => {
        // Password only required for new coaches (not editing)
        if (!editingCoach && !value) return 'Temporary password is required';
        if (value && value.length < 6) return 'Password must be at least 6 characters';
        return null;
      },
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
      password: '',
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
        // Use Cloud Function to create coach with Firebase Auth
        await adminCreateCoach({
          email: values.email,
          displayName: values.displayName,
          password: values.password,
          clubIds: values.clubIds,
        });
        notifications.show({
          title: 'Success',
          message: `Coach created! They can log in with the temporary password.`,
          color: 'green',
        });
      }

      await loadData();
      close();
      form.reset();
      setEditingCoach(null);
    } catch (error: unknown) {
      console.error('Failed to save coach:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save coach';
      notifications.show({
        title: 'Error',
        message: errorMessage.includes('already-exists')
          ? 'A user with this email already exists'
          : errorMessage,
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (coach: User) => {
    setDeletingCoach(coach);
    openDelete();
  };

  const handleDelete = async () => {
    if (!deletingCoach) return;
    try {
      setDeleting(true);
      await adminDeleteUser({ uid: deletingCoach.uid });
      notifications.show({
        title: 'Success',
        message: 'Coach removed successfully',
        color: 'green',
      });
      await loadData();
      closeDelete();
      setDeletingCoach(null);
    } catch (error: unknown) {
      console.error('Failed to delete coach:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to remove coach',
        color: 'red',
      });
    } finally {
      setDeleting(false);
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
                    <Group gap="xs">
                      <Button
                        variant="subtle"
                        size="xs"
                        onClick={() => handleOpenEdit(coach)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="subtle"
                        color="red"
                        size="xs"
                        onClick={() => handleOpenDelete(coach)}
                      >
                        Remove
                      </Button>
                    </Group>
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
            {!editingCoach && (
              <PasswordInput
                label="Temporary Password"
                placeholder="Min 6 characters"
                description="Coach can change this in settings after first login"
                required
                {...form.getInputProps('password')}
              />
            )}
            <MultiSelect
              label="Assigned Clubs"
              placeholder="Select clubs"
              data={clubs.map((c) => ({ value: c.id, label: c.name }))}
              value={form.values.clubIds}
              onChange={(value) => form.setFieldValue('clubIds', value)}
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

      <Modal
        opened={deleteOpened}
        onClose={() => {
          closeDelete();
          setDeletingCoach(null);
        }}
        title="Remove Coach"
        size="sm"
      >
        <Stack>
          <Text>
            Are you sure you want to remove <strong>{deletingCoach?.displayName || deletingCoach?.email}</strong>?
          </Text>
          <Text size="sm" c="dimmed">
            This will permanently delete their account and they will no longer be able to access the system.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              onClick={() => {
                closeDelete();
                setDeletingCoach(null);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete} loading={deleting}>
              Remove Coach
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
