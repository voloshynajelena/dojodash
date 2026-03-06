'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Title, Text, Group, Stack, Badge, Avatar, Loader, Center,
  TextInput, Paper, Table, Select, Button, Affix, Transition, ActionIcon
} from '@mantine/core';
import { useWindowScroll } from '@mantine/hooks';
import { IconUsers, IconSearch, IconBrandInstagram, IconMail, IconPhone, IconArrowLeft, IconArrowUp } from '@tabler/icons-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { getGroups, getGroupMembers } from '@dojodash/firebase';
import type { Group as GroupType, GroupMember } from '@dojodash/core';

interface MemberWithGroup extends GroupMember {
  groupId: string;
  groupName: string;
  groupColor: string;
}

export default function CoachMembersPage() {
  const { claims } = useAuth();
  const router = useRouter();
  const clubId = claims?.clubIds?.[0] || '';
  const [scroll, scrollTo] = useWindowScroll();

  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [allMembers, setAllMembers] = useState<MemberWithGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroupId, setFilterGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (clubId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [clubId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const groupsData = await getGroups(clubId);
      setGroups(groupsData);

      // Load all members from all groups
      const membersPromises = groupsData.map(async (group) => {
        const members = await getGroupMembers(clubId, group.id);
        return members.map((member) => ({
          ...member,
          groupId: group.id,
          groupName: group.name,
          groupColor: group.color || 'blue',
        }));
      });

      const allMembersArrays = await Promise.all(membersPromises);
      const flatMembers = allMembersArrays.flat();
      setAllMembers(flatMembers);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = allMembers.filter((member) => {
    const matchesSearch = member.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.instagram?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = !filterGroupId || member.groupId === filterGroupId;
    return matchesSearch && matchesGroup;
  });

  if (loading) {
    return (
      <AuthGuard allowedRoles={['ADMIN', 'COACH']}>
        <Center h={300}>
          <Loader size="lg" />
        </Center>
      </AuthGuard>
    );
  }

  if (!clubId) {
    return (
      <AuthGuard allowedRoles={['ADMIN', 'COACH']}>
        <Center h={300}>
          <Stack align="center" gap="md">
            <IconUsers size={48} color="gray" style={{ opacity: 0.5 }} />
            <Text c="dimmed" ta="center">
              You are not assigned to any club yet.<br />
              Please contact an administrator.
            </Text>
          </Stack>
        </Center>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={['ADMIN', 'COACH']}>
      <Stack gap="lg">
        <Group>
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.push('/app/coach')}
          >
            Back
          </Button>
        </Group>

        <div>
          <Title order={2}>Members</Title>
          <Text c="dimmed">All members across your groups</Text>
        </div>

        <Group>
          <TextInput
            placeholder="Search members..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            style={{ flex: 1, maxWidth: 300 }}
          />
          <Select
            placeholder="All groups"
            clearable
            data={groups.map((g) => ({ value: g.id, label: g.name }))}
            value={filterGroupId}
            onChange={setFilterGroupId}
            style={{ width: 200 }}
          />
        </Group>

        <Paper withBorder>
          {filteredMembers.length === 0 ? (
            <Center p="xl">
              <Stack align="center" gap="md">
                <IconUsers size={48} color="gray" style={{ opacity: 0.5 }} />
                <Text c="dimmed" ta="center">
                  {allMembers.length === 0
                    ? 'No members yet. Add members to your groups to see them here.'
                    : 'No members match your search.'}
                </Text>
              </Stack>
            </Center>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Group</Table.Th>
                  <Table.Th>Contact</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredMembers.map((member) => (
                  <Table.Tr key={`${member.groupId}-${member.childId}`}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar size="sm" radius="xl" color="blue">
                          {member.childName[0]}
                        </Avatar>
                        <Text size="sm" fw={500}>{member.childName}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color={member.groupColor}>
                        {member.groupName}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {member.instagram && (
                          <Group gap={4}>
                            <IconBrandInstagram size={14} color="gray" />
                            <Text size="xs" c="dimmed">@{member.instagram.replace('@', '')}</Text>
                          </Group>
                        )}
                        {member.email && (
                          <Group gap={4}>
                            <IconMail size={14} color="gray" />
                            <Text size="xs" c="dimmed">{member.email}</Text>
                          </Group>
                        )}
                        {member.phone && (
                          <Group gap={4}>
                            <IconPhone size={14} color="gray" />
                            <Text size="xs" c="dimmed">{member.phone}</Text>
                          </Group>
                        )}
                        {!member.instagram && !member.email && !member.phone && (
                          <Text size="xs" c="dimmed">-</Text>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="sm" variant="light" color={member.status === 'active' ? 'green' : 'gray'}>
                        {member.status || 'active'}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Paper>

        <Text size="sm" c="dimmed">
          Total: {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
          {filterGroupId && ` in ${groups.find(g => g.id === filterGroupId)?.name}`}
        </Text>
      </Stack>

      <Affix position={{ bottom: 20, right: 20 }}>
        <Transition transition="slide-up" mounted={scroll.y > 0}>
          {(transitionStyles) => (
            <ActionIcon
              size="lg"
              radius="xl"
              variant="filled"
              style={transitionStyles}
              onClick={() => scrollTo({ y: 0 })}
            >
              <IconArrowUp size={18} />
            </ActionIcon>
          )}
        </Transition>
      </Affix>
    </AuthGuard>
  );
}
