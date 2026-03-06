'use client';

import { useState, useEffect } from 'react';
import {
  Title, Text, Stack, Button, Modal, TextInput, Group, Card, Avatar, Badge,
  ActionIcon, Table, Loader, Center, Select
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm, zodResolver } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconUser, IconEdit, IconTrash } from '@tabler/icons-react';
import { createChildSchema } from '@dojodash/core';
import type { Child, Group as GroupType } from '@dojodash/core';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import {
  getChildren, createChild, updateChild, deleteChild,
  getGroups, addGroupMember, removeGroupMember
} from '@dojodash/firebase';
import { EmptyState } from '@dojodash/ui';

export default function FamilyChildrenPage() {
  const { user } = useAuth();
  const clubId = 'demo-club';

  const [children, setChildren] = useState<Child[]>([]);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      nickname: '',
      dateOfBirth: new Date(),
      groupId: '',
    },
    validate: zodResolver(createChildSchema),
  });

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [childrenData, groupsData] = await Promise.all([
        getChildren(user.uid),
        getGroups(clubId),
      ]);
      setChildren(childrenData);
      setGroups(groupsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingChild(null);
    form.reset();
    open();
  };

  const handleOpenEdit = (child: Child) => {
    setEditingChild(child);
    form.setValues({
      firstName: child.firstName,
      lastName: child.lastName,
      nickname: child.nickname || '',
      dateOfBirth: child.dateOfBirth?.seconds
        ? new Date(child.dateOfBirth.seconds * 1000)
        : new Date(),
      groupId: child.groupIds?.[0] || '',
    });
    open();
  };

  const handleSave = async (values: typeof form.values) => {
    if (!user) return;

    try {
      setSaving(true);
      const selectedGroupId = values.groupId;

      if (editingChild) {
        // Update existing child
        const updateData: Parameters<typeof updateChild>[2] = {
          firstName: values.firstName,
          lastName: values.lastName,
          dateOfBirth: {
            seconds: Math.floor(values.dateOfBirth.getTime() / 1000),
            nanoseconds: 0,
          },
          groupIds: selectedGroupId ? [selectedGroupId] : [],
        };

        if (values.nickname && values.nickname.trim()) {
          updateData.nickname = values.nickname.trim();
        }

        await updateChild(user.uid, editingChild.id, updateData);

        // Handle group membership change
        const oldGroupId = editingChild.groupIds?.[0];
        if (oldGroupId !== selectedGroupId) {
          // Remove from old group
          if (oldGroupId) {
            try {
              await removeGroupMember(clubId, oldGroupId, editingChild.id);
            } catch (e) {
              console.warn('Could not remove from old group:', e);
            }
          }
          // Add to new group
          if (selectedGroupId) {
            await addGroupMember(clubId, selectedGroupId, {
              childId: editingChild.id,
              childName: `${values.firstName} ${values.lastName}`,
              parentUid: user.uid,
              joinedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
              status: 'active',
            });
          }
        }

        notifications.show({
          title: 'Success',
          message: `${values.firstName}'s profile updated`,
          color: 'green',
        });
      } else {
        // Create new child
        const childData: Parameters<typeof createChild>[1] = {
          firstName: values.firstName,
          lastName: values.lastName,
          dateOfBirth: {
            seconds: Math.floor(values.dateOfBirth.getTime() / 1000),
            nanoseconds: 0,
          },
          groupIds: selectedGroupId ? [selectedGroupId] : [],
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
        };

        if (values.nickname && values.nickname.trim()) {
          childData.nickname = values.nickname.trim();
        }

        const childId = await createChild(user.uid, childData);

        // Add to group if selected
        if (selectedGroupId) {
          await addGroupMember(clubId, selectedGroupId, {
            childId: childId,
            childName: `${values.firstName} ${values.lastName}`,
            parentUid: user.uid,
            joinedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
            status: 'active',
          });
        }

        notifications.show({
          title: 'Success',
          message: `${values.firstName} added`,
          color: 'green',
        });
      }

      await loadData();
      form.reset();
      setEditingChild(null);
      close();
    } catch (error) {
      console.error('Failed to save child:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save child',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (child: Child) => {
    if (!user) return;

    if (!confirm(`Are you sure you want to remove ${child.firstName}?`)) return;

    try {
      // Remove from groups first
      if (child.groupIds) {
        for (const groupId of child.groupIds) {
          try {
            await removeGroupMember(clubId, groupId, child.id);
          } catch (e) {
            console.warn('Could not remove from group:', e);
          }
        }
      }

      await deleteChild(user.uid, child.id);
      notifications.show({
        title: 'Success',
        message: `${child.firstName} removed`,
        color: 'green',
      });
      await loadData();
    } catch (error) {
      console.error('Failed to delete child:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to remove child',
        color: 'red',
      });
    }
  };

  const formatAge = (dateOfBirth?: { seconds: number; nanoseconds: number }) => {
    if (!dateOfBirth?.seconds) return '-';
    const birth = new Date(dateOfBirth.seconds * 1000);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} yrs`;
  };

  const getGroupName = (groupIds?: string[]) => {
    if (!groupIds || groupIds.length === 0) return '-';
    const group = groups.find(g => g.id === groupIds[0]);
    return group?.name || '-';
  };

  const getGroupColor = (groupIds?: string[]) => {
    if (!groupIds || groupIds.length === 0) return 'gray';
    const group = groups.find(g => g.id === groupIds[0]);
    return group?.color || 'gray';
  };

  if (loading) {
    return (
      <AuthGuard allowedRoles={['FAMILY']}>
        <Center h={300}>
          <Loader size="lg" />
        </Center>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={['FAMILY']}>
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>My Children</Title>
            <Text c="dimmed">Manage your children's profiles</Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={handleOpenAdd}>
            Add Child
          </Button>
        </Group>

        {children.length === 0 ? (
          <EmptyState
            icon={<IconUser size={32} />}
            title="No children added yet"
            description="Add your first child to start tracking their progress"
            action={{ label: 'Add Child', onClick: handleOpenAdd }}
            color="blue"
          />
        ) : (
          <Card withBorder p={0}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Age</Table.Th>
                  <Table.Th>Group</Table.Th>
                  <Table.Th>Level</Table.Th>
                  <Table.Th>XP</Table.Th>
                  <Table.Th style={{ width: 100 }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {children.map((child) => (
                  <Table.Tr key={child.id}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar size="sm" radius="xl" color="blue">
                          {child.firstName[0]}{child.lastName[0]}
                        </Avatar>
                        <div>
                          <Text size="sm" fw={500}>
                            {child.firstName} {child.lastName}
                          </Text>
                          {child.nickname && (
                            <Text size="xs" c="dimmed">"{child.nickname}"</Text>
                          )}
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{formatAge(child.dateOfBirth)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getGroupColor(child.groupIds)} variant="light" size="sm">
                        {getGroupName(child.groupIds)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="blue" variant="light" size="sm">
                        Lvl {child.stats?.level || 1}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="green" variant="light" size="sm">
                        {child.stats?.totalXP || 0} XP
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="blue"
                          onClick={() => handleOpenEdit(child)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="red"
                          onClick={() => handleDelete(child)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        )}

        <Modal
          opened={opened}
          onClose={() => { close(); setEditingChild(null); }}
          title={editingChild ? 'Edit Child' : 'Add Child'}
        >
          <form onSubmit={form.onSubmit(handleSave)}>
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
              <Select
                label="Training Group"
                placeholder="Select a group"
                data={[
                  { value: '', label: 'No group' },
                  ...groups.map(g => ({ value: g.id, label: g.name })),
                ]}
                {...form.getInputProps('groupId')}
              />
              <Group justify="flex-end" mt="md">
                <Button variant="subtle" onClick={() => { close(); setEditingChild(null); }} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  {editingChild ? 'Save Changes' : 'Add Child'}
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </Stack>
    </AuthGuard>
  );
}
