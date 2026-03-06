'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Container, Title, Text, Card, Table, Badge, TextInput, Loader, Center,
  Button, Group, Modal, Stack, Select
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconSearch } from '@tabler/icons-react';
import { getAllUsers, getChildren, disableUser, updateUser } from '@dojodash/firebase';
import type { User, Child } from '@dojodash/core';

interface UserWithChildren extends User {
  children?: Child[];
  childCount?: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithChildren | null>(null);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [toggling, setToggling] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const usersData = await getAllUsers();

      // Get children count for family users
      const usersWithChildren: UserWithChildren[] = await Promise.all(
        usersData.map(async (user) => {
          if (user.role === 'FAMILY') {
            try {
              const children = await getChildren(user.uid);
              return { ...user, children, childCount: children.length };
            } catch {
              return { ...user, childCount: 0 };
            }
          }
          return user;
        })
      );

      setUsers(usersWithChildren);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const searchLower = search.toLowerCase();
    return users.filter(
      (user) =>
        user.email.toLowerCase().includes(searchLower) ||
        user.displayName?.toLowerCase().includes(searchLower)
    );
  }, [users, search]);

  const handleViewDetails = (user: UserWithChildren) => {
    setSelectedUser(user);
    openDetails();
  };

  const handleToggleStatus = async (user: UserWithChildren) => {
    try {
      setToggling(true);
      await disableUser(user.uid, !user.disabled);
      notifications.show({
        title: 'Success',
        message: `User ${user.disabled ? 'enabled' : 'disabled'} successfully`,
        color: 'green',
      });
      await loadData();
      closeDetails();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update user status',
        color: 'red',
      });
    } finally {
      setToggling(false);
    }
  };

  const handleChangeRole = async (user: UserWithChildren, newRole: string) => {
    try {
      setUpdatingRole(true);
      await updateUser(user.uid, { role: newRole as 'ADMIN' | 'COACH' | 'FAMILY' });
      notifications.show({
        title: 'Success',
        message: `User role changed to ${newRole}`,
        color: 'green',
      });
      await loadData();
      // Update selected user
      setSelectedUser((prev) => prev ? { ...prev, role: newRole as 'ADMIN' | 'COACH' | 'FAMILY' } : null);
    } catch (error) {
      console.error('Failed to change role:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to change user role',
        color: 'red',
      });
    } finally {
      setUpdatingRole(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'red';
      case 'COACH':
        return 'blue';
      case 'FAMILY':
        return 'green';
      default:
        return 'gray';
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
      <Title order={2} mb="xs">
        Users
      </Title>
      <Text c="dimmed" mb="xl">
        View all families and children
      </Text>

      <TextInput
        placeholder="Search users..."
        leftSection={<IconSearch size={16} />}
        mb="lg"
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      <Card withBorder>
        {filteredUsers.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            {search ? 'No users match your search.' : 'No users found.'}
          </Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Children</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredUsers.map((user) => (
                <Table.Tr key={user.uid}>
                  <Table.Td>{user.displayName || '-'}</Table.Td>
                  <Table.Td>{user.email}</Table.Td>
                  <Table.Td>
                    <Badge color={getRoleColor(user.role)}>{user.role}</Badge>
                  </Table.Td>
                  <Table.Td>
                    {user.role === 'FAMILY' ? user.childCount || 0 : '-'}
                  </Table.Td>
                  <Table.Td>
                    <Badge color={user.disabled ? 'red' : 'green'}>
                      {user.disabled ? 'Disabled' : 'Active'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Button
                      variant="subtle"
                      size="xs"
                      onClick={() => handleViewDetails(user)}
                    >
                      View
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      <Modal
        opened={detailsOpened}
        onClose={closeDetails}
        title="User Details"
        size="md"
      >
        {selectedUser && (
          <Stack>
            <div>
              <Text size="sm" c="dimmed">
                Name
              </Text>
              <Text>{selectedUser.displayName || '-'}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">
                Email
              </Text>
              <Text>{selectedUser.email}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed" mb="xs">
                Role
              </Text>
              <Select
                data={[
                  { value: 'ADMIN', label: 'Admin' },
                  { value: 'COACH', label: 'Coach' },
                  { value: 'FAMILY', label: 'Family' },
                ]}
                value={selectedUser.role}
                onChange={(value) => value && handleChangeRole(selectedUser, value)}
                disabled={updatingRole}
                w={150}
              />
            </div>
            <div>
              <Text size="sm" c="dimmed">
                Status
              </Text>
              <Badge color={selectedUser.disabled ? 'red' : 'green'}>
                {selectedUser.disabled ? 'Disabled' : 'Active'}
              </Badge>
            </div>

            {selectedUser.role === 'FAMILY' && selectedUser.children && (
              <div>
                <Text size="sm" c="dimmed" mb="xs">
                  Children ({selectedUser.children.length})
                </Text>
                {selectedUser.children.length === 0 ? (
                  <Text size="sm" c="dimmed">
                    No children registered
                  </Text>
                ) : (
                  <Stack gap="xs">
                    {selectedUser.children.map((child) => (
                      <Card key={child.id} withBorder p="sm">
                        <Text size="sm" fw={500}>
                          {child.firstName} {child.lastName}
                        </Text>
                        {child.nickname && (
                          <Text size="xs" c="dimmed">
                            "{child.nickname}"
                          </Text>
                        )}
                      </Card>
                    ))}
                  </Stack>
                )}
              </div>
            )}

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={closeDetails}>
                Close
              </Button>
              <Button
                color={selectedUser.disabled ? 'green' : 'red'}
                variant="light"
                onClick={() => handleToggleStatus(selectedUser)}
                loading={toggling}
              >
                {selectedUser.disabled ? 'Enable User' : 'Disable User'}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
