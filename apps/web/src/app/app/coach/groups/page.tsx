'use client';

import { useState, useEffect } from 'react';
import {
  Container, Title, Text, Card, Button, Group, SimpleGrid, Badge, Stack,
  Avatar, Modal, TextInput, Textarea, ColorInput, Tabs,
  CopyButton, ActionIcon, Tooltip, Loader, Center, Paper
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconPlus, IconUsers, IconCopy, IconCheck, IconTrash,
  IconUserPlus, IconLink, IconBrandInstagram, IconMail, IconPhone, IconEdit
} from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import {
  getGroups, createGroup, updateGroup, deleteGroup,
  getGroupMembers, addGroupMember, removeGroupMember, updateGroupMember, createGroupInvite
} from '@dojodash/firebase';
import type { Group as GroupType, GroupMember } from '@dojodash/core';

export default function CoachGroupsPage() {
  const { user, claims } = useAuth();
  const clubId = 'demo-club';

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
  const [editingMember, setEditingMember] = useState<GroupMember | null>(null);

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
    loadGroups();
  }, [clubId]);

  const loadGroups = async () => {
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

    try {
      await deleteGroup(clubId, selectedGroup.id);

      notifications.show({
        title: 'Success',
        message: 'Group deleted successfully',
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
                      <Group justify="space-between">
                        <Group gap="sm">
                          <Avatar size="sm" radius="xl" color="blue">
                            {member.childName[0]}
                          </Avatar>
                          <div>
                            <Text size="sm" fw={500}>{member.childName}</Text>
                            <Group gap="xs">
                              {member.instagram && (
                                <a
                                  href={`https://instagram.com/${member.instagram.replace('@', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                                >
                                  <IconBrandInstagram size={12} color="gray" />
                                  <Text size="xs" c="dimmed">@{member.instagram.replace('@', '')}</Text>
                                </a>
                              )}
                              {member.email && (
                                <a
                                  href={`mailto:${member.email}`}
                                  style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                                >
                                  <IconMail size={12} color="gray" />
                                  <Text size="xs" c="dimmed">{member.email}</Text>
                                </a>
                              )}
                              {member.phone && (
                                <a
                                  href={`tel:${member.phone}`}
                                  style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                                >
                                  <IconPhone size={12} color="gray" />
                                  <Text size="xs" c="dimmed">{member.phone}</Text>
                                </a>
                              )}
                            </Group>
                          </div>
                        </Group>
                        <Group gap="xs">
                          <Badge size="sm" variant="light" color={member.status === 'active' ? 'green' : 'gray'}>
                            {member.status}
                          </Badge>
                          <ActionIcon
                            size="sm"
                            color="blue"
                            variant="subtle"
                            onClick={() => handleOpenEditMember(member)}
                          >
                            <IconEdit size={14} />
                          </ActionIcon>
                          <ActionIcon
                            size="sm"
                            color="red"
                            variant="subtle"
                            onClick={() => handleRemoveMember(member)}
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
            Generate an invite code or link that families can use to join this group.
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
    </Container>
  );
}
