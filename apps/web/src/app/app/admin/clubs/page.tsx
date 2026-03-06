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
import { getAllClubs, createClub, updateClub, getClubMembers } from '@dojodash/firebase';
import type { Club } from '@dojodash/core';

interface ClubWithStats extends Club {
  coachCount?: number;
  memberCount?: number;
}

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState<ClubWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingClub, setEditingClub] = useState<ClubWithStats | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      name: '',
      slug: '',
      timezone: 'America/New_York',
    },
    validate: {
      name: (value) => (!value ? 'Club name is required' : null),
      slug: (value) => (!value ? 'Slug is required' : null),
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const clubsData = await getAllClubs();

      // Get member counts
      const clubsWithStats: ClubWithStats[] = await Promise.all(
        clubsData.map(async (club) => {
          try {
            const members = await getClubMembers(club.id);
            return {
              ...club,
              memberCount: members.length,
              coachCount: 1, // TODO: count actual coaches
            };
          } catch {
            return { ...club, memberCount: 0, coachCount: 0 };
          }
        })
      );

      setClubs(clubsWithStats);
    } catch (error) {
      console.error('Failed to load clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingClub(null);
    form.reset();
    open();
  };

  const handleOpenEdit = (club: ClubWithStats) => {
    setEditingClub(club);
    form.setValues({
      name: club.name,
      slug: club.slug || '',
      timezone: club.timezone || 'America/New_York',
    });
    open();
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSave = async (values: typeof form.values) => {
    try {
      setSaving(true);

      if (editingClub) {
        await updateClub(editingClub.id, {
          name: values.name,
          slug: values.slug,
          timezone: values.timezone,
        });
        notifications.show({
          title: 'Success',
          message: 'Club updated successfully',
          color: 'green',
        });
      } else {
        await createClub({
          name: values.name,
          slug: values.slug,
          timezone: values.timezone,
        });
        notifications.show({
          title: 'Success',
          message: 'Club created successfully',
          color: 'green',
        });
      }

      await loadData();
      close();
      form.reset();
      setEditingClub(null);
    } catch (error) {
      console.error('Failed to save club:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save club',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
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
          <Title order={2}>Clubs</Title>
          <Text c="dimmed">Manage all clubs in the system</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={handleOpenAdd}>
          Create Club
        </Button>
      </Group>

      <Card withBorder>
        {clubs.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No clubs yet. Create your first club to get started.
          </Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Slug</Table.Th>
                <Table.Th>Members</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {clubs.map((club) => (
                <Table.Tr key={club.id}>
                  <Table.Td>{club.name}</Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{club.slug || '-'}</Text>
                  </Table.Td>
                  <Table.Td>{club.memberCount || 0}</Table.Td>
                  <Table.Td>
                    <Badge color="green">Active</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Button
                      variant="subtle"
                      size="xs"
                      onClick={() => handleOpenEdit(club)}
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
          setEditingClub(null);
        }}
        title={editingClub ? 'Edit Club' : 'Create Club'}
      >
        <form onSubmit={form.onSubmit(handleSave)}>
          <Stack>
            <TextInput
              label="Club Name"
              placeholder="My Awesome Dojo"
              required
              {...form.getInputProps('name')}
              onChange={(e) => {
                form.setFieldValue('name', e.currentTarget.value);
                if (!editingClub) {
                  form.setFieldValue('slug', generateSlug(e.currentTarget.value));
                }
              }}
            />
            <TextInput
              label="Slug"
              placeholder="my-awesome-dojo"
              description="URL-friendly identifier"
              required
              {...form.getInputProps('slug')}
            />
            <Select
              label="Timezone"
              data={[
                { value: 'America/New_York', label: 'Eastern Time' },
                { value: 'America/Chicago', label: 'Central Time' },
                { value: 'America/Denver', label: 'Mountain Time' },
                { value: 'America/Los_Angeles', label: 'Pacific Time' },
                { value: 'Europe/London', label: 'London' },
                { value: 'Europe/Paris', label: 'Paris' },
                { value: 'Europe/Kiev', label: 'Kyiv' },
              ]}
              {...form.getInputProps('timezone')}
            />
            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                onClick={() => {
                  close();
                  setEditingClub(null);
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {editingClub ? 'Save Changes' : 'Create Club'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
