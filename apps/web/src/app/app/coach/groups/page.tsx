'use client';

import { useState, useEffect } from 'react';
import {
  Container, Title, Text, Card, Button, Group, SimpleGrid, Badge, Stack,
  Avatar, Modal, TextInput, Textarea, ColorInput, Tabs, Select,
  CopyButton, ActionIcon, Tooltip, Loader, Center, Paper
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconPlus, IconUsers, IconCopy, IconCheck, IconTrash,
  IconUserPlus, IconLink, IconBrandInstagram, IconMail, IconPhone, IconEdit,
  IconArrowsExchange, IconCalendar
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  getGroups, createGroup, updateGroup, deleteGroup,
  getGroupMembers, addGroupMember, removeGroupMember, updateGroupMember, createGroupInvite,
  getSessions, deleteSessionsBatch
} from '@dojodash/firebase';
import type { Group as GroupType, GroupMember } from '@dojodash/core';

export default function CoachGroupsPage() {
  const { user, claims } = useAuth();
  const router = useRouter();
  const clubId = claims?.clubIds?.[0] || '';

  const [groups, setGroups] = useState<GroupType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<GroupMember[]>([]);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [manageOpened, { open: openManage, close: closeManage }] = useDisclosure(false);
  const [inviteOpened, { open: openInvite, close: closeInvite }] = useDisclosure(false);
  const [memberModalOpened, { open: openMemberModal, close: closeMemberModal }] = useDisclosure(false);
  const [moveModalOpened, { open: openMoveModal, close: closeMoveModal }] = useDisclosure(false);
  const [editingMember, setEditingMember] = useState<GroupMember | null>(null);
  const [movingMember, setMovingMember] = useState<GroupMember | null>(null);
  const [targetGroupId, setTargetGroupId] = useState<string | null>(null);

  const createForm = useForm({
    initialValues: {
      name: '',
      description: '',
      color: '#4ECDC4',
    },
  });

  const editForm = useForm({
    initialValues: {
      name: '',
      description: '',
      color: '#4ECDC4',
    },
  });

  const addMemberForm = useForm({
    initialValues: {
      name: '',
      instagram: '',
      email: '',
      phone: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (clubId) {
      loadGroups();
    } else {
      setLoading(false);
    }
  }, [clubId]);

  const loadGroups = async () => {
    if (!clubId) return;
    try {
      setLoading(true);
      const data = await getGroups(clubId);
      setGroups(data);
    } catch (error) {
      console.error('Failed to load groups:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load groups',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (values: typeof createForm.values) => {
    try {
      await createGroup(clubId, {
        name: values.name,
        description: values.description,
        color: values.color,
      });

      notifications.show({
        title: 'Success',
        message: 'Group created successfully',
        color: 'green',
      });

      createForm.reset();
      closeCreate();
      loadGroups();
    } catch (error) {
      console.error('Failed to create group:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create group',
        color: 'red',
      });
    }
  };

  const handleManageGroup = async (group: GroupType) => {
    setSelectedGroup(group);
    editForm.setValues({
      name: group.name,
      description: group.description ?? '',
      color: group.color ?? '#4ECDC4',
    });

    try {
      const members = await getGroupMembers(clubId, group.id);
      setSelectedMembers(members);
    } catch (error) {
      console.error('Failed to load members:', error);
      setSelectedMembers([]);
    }

    openManage();
  };

  const handleUpdateGroup = async (values: typeof editForm.values) => {
    if (!selectedGroup) return;

    try {
      await updateGroup(clubId, selectedGroup.id, {
        name: values.name,
        description: values.description,
        color: values.color,
      });

      notifications.show({
        title: 'Success',
        message: 'Group updated successfully',
        color: 'green',
      });

      closeManage();
      loadGroups();
    } catch (error) {
      console.error('Failed to update group:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update group',
        color: 'red',
      });
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;

    if (!confirm(`Are you sure you want to delete "${selectedGroup.name}"? This will also delete all scheduled sessions for this group.`)) {
      return;
    }

    try {
      // First, delete all sessions associated with this group
      const groupSessions = await getSessions(clubId, selectedGroup.id);
      if (groupSessions.length > 0) {
        const sessionIds = groupSessions.map(s => s.id);
        await deleteSessionsBatch(clubId, sessionIds);
      }

      // Then delete the group
      await deleteGroup(clubId, selectedGroup.id);

      notifications.show({
        title: 'Success',
        message: `Group deleted along with ${groupSessions.length} session(s)`,
        color: 'green',
      });

      closeManage();
      loadGroups();
    } catch (error) {
      console.error('Failed to delete group:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete group',
        color: 'red',
      });
    }
  };

  const handleInvite = async (group: GroupType) => {
    setSelectedGroup(group);
    setInviteCode(null);
    setInviteLink(null);
    openInvite();
  };

  const handleGenerateInvite = async () => {
    if (!selectedGroup || !user) return;

    try {
      const invite = await createGroupInvite(
        clubId,
        selectedGroup.id,
        user.uid,
        7,
        10
      );

      setInviteCode(invite.code);
      setInviteLink(`${window.location.origin}/join?code=${invite.code}`);

      notifications.show({
        title: 'Success',
        message: 'Invite code generated',
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to generate invite:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to generate invite code',
        color: 'red',
      });
    }
  };

  const handleOpenAddMember = () => {
    setEditingMember(null);
    addMemberForm.reset();
    openMemberModal();
  };

  const handleOpenEditMember = (member: GroupMember) => {
    setEditingMember(member);
    addMemberForm.setValues({
      name: member.childName,
      instagram: member.instagram || '',
      email: member.email || '',
      phone: member.phone || '',
      notes: member.notes || '',
    });
    openMemberModal();
  };

  const handleSaveMember = async (values: typeof addMemberForm.values) => {
    if (!selectedGroup) return;

    try {
      if (editingMember) {
        // Update existing member
        await updateGroupMember(clubId, selectedGroup.id, editingMember.childId, {
          childName: values.name,
          instagram: values.instagram || undefined,
          email: values.email || undefined,
          phone: values.phone || undefined,
          notes: values.notes || undefined,
        });

        notifications.show({
          title: 'Success',
          message: `${values.name} updated`,
          color: 'green',
        });
      } else {
        // Add new member
        const memberId = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const memberData: GroupMember = {
          childId: memberId,
          childName: values.name,
          joinedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
          status: 'active',
        };
        // Only add optional fields if they have values (Firestore doesn't accept undefined)
        if (values.instagram) memberData.instagram = values.instagram;
        if (values.email) memberData.email = values.email;
        if (values.phone) memberData.phone = values.phone;
        if (values.notes) memberData.notes = values.notes;

        await addGroupMember(clubId, selectedGroup.id, memberData);

        notifications.show({
          title: 'Success',
          message: `${values.name} added to group`,
          color: 'green',
        });
      }

      // Refresh members
      const members = await getGroupMembers(clubId, selectedGroup.id);
      setSelectedMembers(members);

      addMemberForm.reset();
      setEditingMember(null);
      closeMemberModal();
      loadGroups();
    } catch (error) {
      console.error('Failed to save member:', error);
      notifications.show({
        title: 'Error',
        message: editingMember ? 'Failed to update member' : 'Failed to add member',
        color: 'red',
      });
    }
  };

  const handleRemoveMember = async (member: GroupMember) => {
    if (!selectedGroup) return;

    try {
      await removeGroupMember(clubId, selectedGroup.id, member.childId);

      notifications.show({
        title: 'Success',
        message: `${member.childName} removed from group`,
        color: 'green',
      });

      // Refresh members
      const members = await getGroupMembers(clubId, selectedGroup.id);
      setSelectedMembers(members);
      loadGroups();
    } catch (error) {
      console.error('Failed to remove member:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to remove member',
        color: 'red',
      });
    }
  };

  const handleOpenMoveMember = (member: GroupMember) => {
    setMovingMember(member);
    setTargetGroupId(null);
    openMoveModal();
  };

  const handleMoveMember = async () => {
    if (!selectedGroup || !movingMember || !targetGroupId) return;

    try {
      // Remove from current group
      await removeGroupMember(clubId, selectedGroup.id, movingMember.childId);

      // Add to new group
      await addGroupMember(clubId, targetGroupId, {
        ...movingMember,
        joinedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
      });

      const targetGroup = groups.find(g => g.id === targetGroupId);
      notifications.show({
        title: 'Success',
        message: `${movingMember.childName} moved to ${targetGroup?.name}`,
        color: 'green',
      });

      // Refresh members
      const members = await getGroupMembers(clubId, selectedGroup.id);
      setSelectedMembers(members);
      loadGroups();
      closeMoveModal();
      setMovingMember(null);
      setTargetGroupId(null);
    } catch (error) {
      console.error('Failed to move member:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to move member',
        color: 'red',
      });
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

  if (!clubId) {
    return (
      <Container size="lg" py="xl">
        <Center h={300}>
          <Stack align="center" gap="md">
            <IconUsers size={48} color="gray" style={{ opacity: 0.5 }} />
            <Text c="dimmed" ta="center">
              You are not assigned to any club yet.<br />
              Please contact an administrator.
            </Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Groups</Title>
          <Text c="dimmed">Manage training groups</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
          Create Group
        </Button>
      </Group>

      {groups.length === 0 ? (
        <Card withBorder p="xl" ta="center">
          <IconUsers size={48} color="gray" style={{ opacity: 0.5 }} />
          <Text size="lg" fw={500} mt="md">No groups yet</Text>
          <Text size="sm" c="dimmed" mb="md">
            Create your first group to start organizing classes
          </Text>
          <Button onClick={openCreate}>Create Group</Button>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {groups.map((group) => (
            <Card key={group.id} withBorder p="lg">
              <Group justify="space-between" mb="md">
                <Group>
                  <Avatar color={group.color ?? 'blue'} radius="xl">
                    {group.name[0]}
                  </Avatar>
                  <div>
                    <Text fw={500}>{group.name}</Text>
                    {group.description && (
                      <Text size="sm" c="dimmed">{group.description}</Text>
                    )}
                  </div>
                </Group>
                <Badge color="green">{group.memberCount ?? 0} member{(group.memberCount ?? 0) !== 1 ? 's' : ''}</Badge>
              </Group>

              <Group mt="md">
                <Button variant="light" size="xs" onClick={() => handleManageGroup(group)}>
                  Manage
                </Button>
                <Button
                  variant="light"
                  size="xs"
                  leftSection={<IconCalendar size={14} />}
                  onClick={() => router.push(`/app/coach/schedule?group=${group.id}`)}
                >
                  Schedule
                </Button>
                <Button variant="light" size="xs" onClick={() => handleInvite(group)}>
                  Invite
                </Button>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Create Group Modal */}
      <Modal opened={createOpened} onClose={closeCreate} title="Create Group" size="sm">
        <form onSubmit={createForm.onSubmit(handleCreateGroup)}>
          <Stack>
            <TextInput
              label="Group Name"
              placeholder="e.g., Beginners"
              required
              {...createForm.getInputProps('name')}
            />
            <Textarea
              label="Description"
              placeholder="e.g., For ages 5-7"
              {...createForm.getInputProps('description')}
            />
            <ColorInput
              label="Color"
              {...createForm.getInputProps('color')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={closeCreate}>Cancel</Button>
              <Button type="submit">Create Group</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Manage Group Modal */}
      <Modal opened={manageOpened} onClose={closeManage} title={`Manage ${selectedGroup?.name}`} size="lg">
        <Tabs defaultValue="members">
          <Tabs.List mb="md">
            <Tabs.Tab value="members" leftSection={<IconUsers size={14} />}>
              Members ({selectedMembers.length})
            </Tabs.Tab>
            <Tabs.Tab value="settings" leftSection={<IconPlus size={14} />}>
              Settings
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="members">
            <Stack>
              <Group justify="space-between">
                <Text fw={500}>Group Members</Text>
                <Button
                  size="xs"
                  leftSection={<IconUserPlus size={14} />}
                  onClick={handleOpenAddMember}
                >
                  Add Member
                </Button>
              </Group>

              {selectedMembers.length === 0 ? (
                <Paper p="xl" withBorder ta="center">
                  <IconUsers size={32} color="gray" style={{ opacity: 0.5 }} />
                  <Text size="sm" c="dimmed" mt="sm">No members yet</Text>
                  <Button
                    size="sm"
                    mt="md"
                    variant="light"
                    leftSection={<IconUserPlus size={14} />}
                    onClick={handleOpenAddMember}
                  >
                    Add First Member
                  </Button>
                </Paper>
              ) : (
                <Stack gap="xs">
                  {selectedMembers.map((member) => (
                    <Paper key={member.childId} p="sm" withBorder>
                      <Group justify="space-between" wrap="nowrap" align="flex-start">
                        <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                          <Avatar size="sm" radius="xl" color="blue" style={{ flexShrink: 0 }}>
                            {member.childName[0]}
                          </Avatar>
                          <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
                            <Text size="sm" fw={500} truncate>{member.childName}</Text>
                            <Group gap={8} wrap="wrap">
                              {member.instagram && (
                                <Group gap={4} wrap="nowrap">
                                  <IconBrandInstagram size={12} color="gray" style={{ flexShrink: 0 }} />
                                  <Text size="xs" c="dimmed" truncate>@{member.instagram.replace('@', '')}</Text>
                                </Group>
                              )}
                              {member.email && (
                                <Group gap={4} wrap="nowrap">
                                  <IconMail size={12} color="gray" style={{ flexShrink: 0 }} />
                                  <Text size="xs" c="dimmed" truncate>{member.email}</Text>
                                </Group>
                              )}
                              {member.phone && (
                                <Group gap={4} wrap="nowrap">
                                  <IconPhone size={12} color="gray" style={{ flexShrink: 0 }} />
                                  <Text size="xs" c="dimmed">{member.phone}</Text>
                                </Group>
                              )}
                            </Group>
                          </Stack>
                        </Group>
                        <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
                          <Badge size="xs" variant="light" color={member.status === 'active' ? 'green' : 'gray'}>
                            {member.status}
                          </Badge>
                          <ActionIcon
                            size="sm"
                            color="blue"
                            variant="subtle"
                            onClick={() => handleOpenEditMember(member)}
                            title="Edit"
                          >
                            <IconEdit size={14} />
                          </ActionIcon>
                          <ActionIcon
                            size="sm"
                            color="grape"
                            variant="subtle"
                            onClick={() => handleOpenMoveMember(member)}
                            title="Move to another group"
                          >
                            <IconArrowsExchange size={14} />
                          </ActionIcon>
                          <ActionIcon
                            size="sm"
                            color="red"
                            variant="subtle"
                            onClick={() => handleRemoveMember(member)}
                            title="Remove"
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              )}

              <Button
                variant="light"
                fullWidth
                mt="md"
                leftSection={<IconLink size={16} />}
                onClick={() => {
                  closeManage();
                  if (selectedGroup) handleInvite(selectedGroup);
                }}
              >
                Share Invite Link
              </Button>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="settings">
            <form onSubmit={editForm.onSubmit(handleUpdateGroup)}>
              <Stack>
                <TextInput
                  label="Group Name"
                  required
                  {...editForm.getInputProps('name')}
                />
                <Textarea
                  label="Description"
                  {...editForm.getInputProps('description')}
                />
                <ColorInput
                  label="Color"
                  {...editForm.getInputProps('color')}
                />

                <Group justify="space-between" mt="xl">
                  <Button
                    variant="outline"
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={handleDeleteGroup}
                  >
                    Delete Group
                  </Button>
                  <Group>
                    <Button variant="subtle" onClick={closeManage}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                  </Group>
                </Group>
              </Stack>
            </form>
          </Tabs.Panel>
        </Tabs>
      </Modal>

      {/* Add/Edit Member Modal */}
      <Modal
        opened={memberModalOpened}
        onClose={() => { closeMemberModal(); setEditingMember(null); }}
        title={editingMember ? 'Edit Member' : 'Add Member'}
        size="sm"
      >
        <form onSubmit={addMemberForm.onSubmit(handleSaveMember)}>
          <Stack>
            <TextInput
              label="Name"
              placeholder="Member name"
              required
              {...addMemberForm.getInputProps('name')}
            />
            <TextInput
              label="Instagram"
              placeholder="@username"
              leftSection={<IconBrandInstagram size={16} />}
              {...addMemberForm.getInputProps('instagram')}
            />
            <TextInput
              label="Email"
              placeholder="email@example.com"
              leftSection={<IconMail size={16} />}
              {...addMemberForm.getInputProps('email')}
            />
            <TextInput
              label="Phone"
              placeholder="+1 234 567 8900"
              leftSection={<IconPhone size={16} />}
              {...addMemberForm.getInputProps('phone')}
            />
            <Textarea
              label="Notes"
              placeholder="Any additional notes..."
              {...addMemberForm.getInputProps('notes')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={() => { closeMemberModal(); setEditingMember(null); }}>
                Cancel
              </Button>
              <Button type="submit">
                {editingMember ? 'Save Changes' : 'Add Member'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Invite Modal */}
      <Modal opened={inviteOpened} onClose={closeInvite} title={`Invite to ${selectedGroup?.name}`} size="sm">
        <Stack>
          <Text size="sm" c="dimmed">
            Generate an invite code or link that families can use to join the club.
          </Text>

          {inviteCode ? (
            <Stack gap="md">
              <Paper p="lg" withBorder ta="center">
                <Text size="xs" c="dimmed" mb="xs">Invite Code</Text>
                <Group justify="center" gap="xs">
                  <Text size="xl" fw={700} ff="monospace">{inviteCode}</Text>
                  <CopyButton value={inviteCode}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copied' : 'Copy code'}>
                        <ActionIcon color={copied ? 'green' : 'gray'} onClick={copy}>
                          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>
              </Paper>

              {inviteLink && (
                <Paper p="md" withBorder>
                  <Text size="xs" c="dimmed" mb="xs">Or share this link</Text>
                  <Group gap="xs">
                    <TextInput
                      value={inviteLink}
                      readOnly
                      size="xs"
                      style={{ flex: 1 }}
                    />
                    <CopyButton value={inviteLink}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? 'Copied' : 'Copy link'}>
                          <ActionIcon color={copied ? 'green' : 'blue'} variant="filled" onClick={copy}>
                            {copied ? <IconCheck size={16} /> : <IconLink size={16} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  </Group>
                </Paper>
              )}

              <Text size="xs" c="dimmed" ta="center">Valid for 7 days, up to 10 uses</Text>
            </Stack>
          ) : (
            <Button onClick={handleGenerateInvite} fullWidth leftSection={<IconLink size={16} />}>
              Generate Invite Code
            </Button>
          )}

        </Stack>
      </Modal>

      {/* Move Member Modal */}
      <Modal
        opened={moveModalOpened}
        onClose={() => { closeMoveModal(); setMovingMember(null); setTargetGroupId(null); }}
        title="Move to Another Group"
        size="sm"
      >
        <Stack>
          <Text size="sm">
            Move <strong>{movingMember?.childName}</strong> from <strong>{selectedGroup?.name}</strong> to:
          </Text>
          <Select
            label="Target Group"
            placeholder="Select a group"
            data={groups
              .filter(g => g.id !== selectedGroup?.id)
              .map(g => ({ value: g.id, label: g.name }))}
            value={targetGroupId}
            onChange={setTargetGroupId}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => { closeMoveModal(); setMovingMember(null); setTargetGroupId(null); }}>
              Cancel
            </Button>
            <Button onClick={handleMoveMember} disabled={!targetGroupId}>
              Move
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
