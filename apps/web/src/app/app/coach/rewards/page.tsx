'use client';

import { useState, useEffect } from 'react';
import {
  Container, Title, Text, Card, Button, Group, Tabs, Badge, Avatar,
  Modal, TextInput, Stack, Loader, Center, Select, NumberInput, Textarea,
  SimpleGrid, ActionIcon, ColorInput, Progress, Paper, Switch, Box, Divider
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconTrophy, IconMedal, IconTarget, IconPlus, IconEdit, IconTrash,
  IconStar, IconFlame, IconHeart, IconBolt, IconSparkles, IconCrown,
  IconArrowsExchange
} from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import {
  getMedalTemplates, createMedalTemplate, updateMedalTemplate, deactivateMedalTemplate,
  getGoals, createGoal, updateGoal, deleteGoal,
  getGroups, getGroupMembers, awardMedal, awardChampionshipMedal
} from '@dojodash/firebase';
import { MedalGraphic } from '@dojodash/ui/components';
import type { MedalTemplate, MedalCategory, MedalShape, Goal, GoalType, GoalUnit, Group as GroupType, GroupMember } from '@dojodash/core';

const CATEGORY_ICONS: Record<MedalCategory, React.ReactNode> = {
  achievement: <IconTrophy size={20} />,
  skill: <IconBolt size={20} />,
  spirit: <IconHeart size={20} />,
  competition: <IconFlame size={20} />,
  special: <IconSparkles size={20} />,
};

const CATEGORY_COLORS: Record<MedalCategory, string> = {
  achievement: 'yellow',
  skill: 'blue',
  spirit: 'pink',
  competition: 'orange',
  special: 'violet',
};

export default function RewardsPage() {
  const { user, claims } = useAuth();
  const clubId = claims?.clubIds?.[0] || '';

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<MedalTemplate[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [groups, setGroups] = useState<GroupType[]>([]);

  // Template modal
  const [templateOpened, { open: openTemplate, close: closeTemplate }] = useDisclosure(false);
  const [editingTemplate, setEditingTemplate] = useState<MedalTemplate | null>(null);

  // Goal modal
  const [goalOpened, { open: openGoal, close: closeGoal }] = useDisclosure(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Award modal
  const [awardOpened, { open: openAward, close: closeAward }] = useDisclosure(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MedalTemplate | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [awardReason, setAwardReason] = useState('');

  const templateForm = useForm({
    initialValues: {
      name: '',
      description: '',
      color: '#FFD700',
      xpValue: 10,
      category: 'achievement' as MedalCategory,
      isChampionship: false,
      customText: '',
      shape: 'circle' as MedalShape,
      borderStyle: 'solid' as 'solid' | 'double' | 'ribbon',
    },
  });

  const goalForm = useForm({
    initialValues: {
      title: '',
      description: '',
      type: 'attendance' as GoalType,
      target: 10,
      unit: 'sessions' as GoalUnit,
      groupId: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

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
      const [templatesData, goalsData, groupsData] = await Promise.all([
        getMedalTemplates(clubId),
        getGoals(clubId),
        getGroups(clubId),
      ]);
      setTemplates(templatesData);
      setGoals(goalsData);
      setGroups(groupsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateTemplate = () => {
    setEditingTemplate(null);
    templateForm.reset();
    openTemplate();
  };

  const handleOpenEditTemplate = (template: MedalTemplate) => {
    setEditingTemplate(template);
    templateForm.setValues({
      name: template.name,
      description: template.description ?? '',
      color: template.color,
      xpValue: template.xpValue,
      category: template.category,
      isChampionship: template.isChampionship ?? false,
      customText: template.customText ?? '',
      shape: template.shape ?? 'circle',
      borderStyle: template.borderStyle ?? 'solid',
    });
    openTemplate();
  };

  const handleSaveTemplate = async (values: typeof templateForm.values) => {
    try {
      const templateData: Partial<MedalTemplate> = {
        name: values.name,
        description: values.description || undefined,
        color: values.color,
        xpValue: values.xpValue,
        category: values.category,
        isChampionship: values.isChampionship,
        customText: values.customText || undefined,
        shape: values.shape,
        borderStyle: values.borderStyle,
      };

      if (editingTemplate) {
        await updateMedalTemplate(clubId, editingTemplate.id, templateData);
        notifications.show({
          title: 'Success',
          message: 'Reward updated',
          color: 'green',
        });
      } else {
        await createMedalTemplate(clubId, templateData as any);
        notifications.show({
          title: 'Success',
          message: 'Reward created',
          color: 'green',
        });
      }
      closeTemplate();
      loadData();
    } catch (error) {
      console.error('Failed to save template:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save reward',
        color: 'red',
      });
    }
  };

  const handleDeleteTemplate = async (template: MedalTemplate) => {
    try {
      await deactivateMedalTemplate(clubId, template.id);
      notifications.show({
        title: 'Success',
        message: 'Reward deleted',
        color: 'green',
      });
      loadData();
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleOpenCreateGoal = () => {
    setEditingGoal(null);
    goalForm.reset();
    openGoal();
  };

  const handleOpenEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    goalForm.setValues({
      title: goal.title,
      description: goal.description ?? '',
      type: goal.type,
      target: goal.target,
      unit: goal.unit,
      groupId: goal.groupId ?? '',
      startDate: goal.startDate?.seconds ? new Date(goal.startDate.seconds * 1000) : new Date(),
      endDate: goal.endDate?.seconds ? new Date(goal.endDate.seconds * 1000) : new Date(),
    });
    openGoal();
  };

  const handleSaveGoal = async (values: typeof goalForm.values) => {
    try {
      const goalData = {
        title: values.title,
        description: values.description,
        type: values.type,
        target: values.target,
        unit: values.unit,
        groupId: values.groupId || undefined,
        startDate: { seconds: Math.floor(values.startDate.getTime() / 1000), nanoseconds: 0 },
        endDate: { seconds: Math.floor(values.endDate.getTime() / 1000), nanoseconds: 0 },
        createdBy: user?.uid ?? '',
      };

      if (editingGoal) {
        await updateGoal(clubId, editingGoal.id, goalData);
        notifications.show({
          title: 'Success',
          message: 'Goal updated',
          color: 'green',
        });
      } else {
        await createGoal(clubId, goalData);
        notifications.show({
          title: 'Success',
          message: 'Goal created',
          color: 'green',
        });
      }
      closeGoal();
      loadData();
    } catch (error) {
      console.error('Failed to save goal:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save goal',
        color: 'red',
      });
    }
  };

  const handleDeleteGoal = async (goal: Goal) => {
    try {
      await deleteGoal(clubId, goal.id);
      notifications.show({
        title: 'Success',
        message: 'Goal deleted',
        color: 'green',
      });
      loadData();
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  const handleOpenAward = async (template: MedalTemplate) => {
    setSelectedTemplate(template);
    setSelectedGroupId(null);
    setGroupMembers([]);
    setSelectedMemberIds([]);
    setAwardReason('');
    openAward();
  };

  const handleGroupSelect = async (groupId: string | null) => {
    setSelectedGroupId(groupId);
    setSelectedMemberIds([]);
    if (groupId) {
      try {
        const members = await getGroupMembers(clubId, groupId);
        setGroupMembers(members);
      } catch (error) {
        console.error('Failed to load members:', error);
      }
    } else {
      setGroupMembers([]);
    }
  };

  const handleAwardMedal = async () => {
    if (!selectedTemplate || !selectedGroupId || selectedMemberIds.length === 0) return;

    try {
      // Championship medals can only go to one person
      if (selectedTemplate.isChampionship) {
        if (selectedMemberIds.length > 1) {
          notifications.show({
            title: 'Error',
            message: 'Championship medals can only be awarded to one person',
            color: 'red',
          });
          return;
        }

        const memberId = selectedMemberIds[0]!;
        const member = groupMembers.find(m => m.childId === memberId);

        const result = await awardChampionshipMedal(
          clubId,
          selectedTemplate.id,
          memberId,
          member?.childName ?? 'Unknown',
          selectedGroupId!,
          user?.uid ?? '',
          awardReason
        );

        if (result.wasTransferred) {
          notifications.show({
            title: 'Championship Transferred!',
            message: `${selectedTemplate.name} transferred to ${member?.childName}`,
            color: 'yellow',
            icon: <IconArrowsExchange size={16} />,
          });
        } else {
          notifications.show({
            title: 'Championship Awarded!',
            message: `${selectedTemplate.name} awarded to ${member?.childName}`,
            color: 'yellow',
            icon: <IconCrown size={16} />,
          });
        }
      } else {
        // Regular medals - can be awarded to multiple people
        const selectedGroup = groups.find(g => g.id === selectedGroupId);
        for (const memberId of selectedMemberIds) {
          const member = groupMembers.find(m => m.childId === memberId);
          await awardMedal(clubId, {
            templateId: selectedTemplate.id,
            childId: memberId,
            clubId,
            groupId: selectedGroupId,
            name: selectedTemplate.name,
            description: selectedTemplate.description,
            color: selectedTemplate.color,
            xpValue: selectedTemplate.xpValue,
            category: selectedTemplate.category,
            awardedBy: user?.uid ?? '',
            awardedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
            reason: awardReason,
            customText: selectedTemplate.customText,
            shape: selectedTemplate.shape,
            borderStyle: selectedTemplate.borderStyle,
            recipientName: member?.childName,
            groupName: selectedGroup?.name,
          });
        }

        notifications.show({
          title: 'Success',
          message: `Awarded ${selectedTemplate.name} to ${selectedMemberIds.length} member(s)`,
          color: 'green',
          icon: <IconTrophy size={16} />,
        });
      }
      closeAward();
      loadData();
    } catch (error) {
      console.error('Failed to award medal:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to award medal',
        color: 'red',
      });
    }
  };

  const getGroupName = (groupId?: string) => {
    if (!groupId) return 'All Groups';
    return groups.find(g => g.id === groupId)?.name ?? 'Unknown';
  };

  const getGoalProgress = (goal: Goal) => {
    return Math.round((goal.current / goal.target) * 100);
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
            <IconTrophy size={48} color="gray" style={{ opacity: 0.5 }} />
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
          <Title order={2}>Rewards & Goals</Title>
          <Text c="dimmed">Manage medals, rewards, and goals</Text>
        </div>
      </Group>

      <Tabs defaultValue="rewards">
        <Tabs.List mb="lg">
          <Tabs.Tab value="rewards" leftSection={<IconTrophy size={16} />}>
            Rewards
          </Tabs.Tab>
          <Tabs.Tab value="goals" leftSection={<IconTarget size={16} />}>
            Goals
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="rewards">
          <Group justify="space-between" mb="md">
            <Text fw={500}>Reward Templates</Text>
            <Button leftSection={<IconPlus size={16} />} onClick={handleOpenCreateTemplate}>
              Create Reward
            </Button>
          </Group>

          {templates.length === 0 ? (
            <Card withBorder p="xl" ta="center">
              <IconTrophy size={48} color="gray" style={{ opacity: 0.5 }} />
              <Text c="dimmed" mt="md">No rewards created yet.</Text>
              <Button mt="md" variant="light" onClick={handleOpenCreateTemplate}>
                Create Your First Reward
              </Button>
            </Card>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
              {templates.map(template => (
                <Card key={template.id} withBorder padding="md">
                  <Stack align="center" mb="md">
                    <MedalGraphic
                      name={template.name}
                      customText={template.customText}
                      color={template.color}
                      shape={template.shape}
                      borderStyle={template.borderStyle}
                      size="md"
                      isChampionship={template.isChampionship}
                      currentHolderName={template.currentHolderName}
                    />
                  </Stack>

                  <Group justify="space-between" mb="xs">
                    <Badge size="sm" color={CATEGORY_COLORS[template.category]}>
                      {template.category}
                    </Badge>
                    <Badge variant="light" color="green">
                      +{template.xpValue} XP
                    </Badge>
                  </Group>

                  {template.description && (
                    <Text size="sm" c="dimmed" mb="sm" ta="center">{template.description}</Text>
                  )}

                  <Group gap="xs" justify="center" mt="auto">
                    <Button
                      variant="light"
                      size="xs"
                      leftSection={template.isChampionship ? <IconCrown size={14} /> : <IconTrophy size={14} />}
                      onClick={() => handleOpenAward(template)}
                      color={template.isChampionship ? 'yellow' : 'blue'}
                    >
                      {template.isChampionship && template.currentHolderId ? 'Transfer' : 'Award'}
                    </Button>
                    <ActionIcon variant="subtle" onClick={() => handleOpenEditTemplate(template)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteTemplate(template)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="goals">
          <Group justify="space-between" mb="md">
            <Text fw={500}>Active Goals</Text>
            <Button leftSection={<IconPlus size={16} />} onClick={handleOpenCreateGoal}>
              Create Goal
            </Button>
          </Group>

          {goals.length === 0 ? (
            <Card withBorder p="xl" ta="center">
              <IconTarget size={48} color="gray" style={{ opacity: 0.5 }} />
              <Text c="dimmed" mt="md">No active goals.</Text>
              <Button mt="md" variant="light" onClick={handleOpenCreateGoal}>
                Create Your First Goal
              </Button>
            </Card>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              {goals.map(goal => (
                <Card key={goal.id} withBorder padding="md">
                  <Group justify="space-between" mb="xs">
                    <Group>
                      <Avatar color="blue" radius="xl">
                        <IconTarget size={20} />
                      </Avatar>
                      <div>
                        <Text fw={500}>{goal.title}</Text>
                        <Text size="xs" c="dimmed">{getGroupName(goal.groupId)}</Text>
                      </div>
                    </Group>
                    <Badge color={goal.status === 'completed' ? 'green' : 'blue'}>
                      {goal.status}
                    </Badge>
                  </Group>

                  {goal.description && (
                    <Text size="sm" c="dimmed" mb="sm">{goal.description}</Text>
                  )}

                  <Progress value={getGoalProgress(goal)} color="blue" size="lg" radius="xl" mb="xs" />

                  <Group justify="space-between">
                    <Text size="sm">{goal.current} / {goal.target} {goal.unit}</Text>
                    <Text size="sm" c="dimmed">{getGoalProgress(goal)}%</Text>
                  </Group>

                  <Group gap="xs" mt="md">
                    <ActionIcon variant="subtle" onClick={() => handleOpenEditGoal(goal)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteGoal(goal)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Tabs.Panel>
      </Tabs>

      {/* Create/Edit Template Modal */}
      <Modal
        opened={templateOpened}
        onClose={closeTemplate}
        title={editingTemplate ? 'Edit Reward' : 'Create Reward'}
        size="lg"
      >
        <form onSubmit={templateForm.onSubmit(handleSaveTemplate)}>
          <Group align="flex-start" gap="xl">
            {/* Preview */}
            <Box style={{ minWidth: 150 }}>
              <Text size="sm" fw={500} mb="sm" ta="center">Preview</Text>
              <MedalGraphic
                name={templateForm.values.name || 'Medal Name'}
                customText={templateForm.values.customText}
                color={templateForm.values.color}
                shape={templateForm.values.shape}
                borderStyle={templateForm.values.borderStyle}
                size="lg"
                isChampionship={templateForm.values.isChampionship}
              />
            </Box>

            {/* Form fields */}
            <Stack style={{ flex: 1 }}>
              <TextInput
                label="Name"
                placeholder="e.g., Best Kicker"
                required
                {...templateForm.getInputProps('name')}
              />

              <TextInput
                label="Custom Text (on medal)"
                placeholder="e.g., CHAMP or a short text"
                description="Short text displayed on the medal graphic"
                {...templateForm.getInputProps('customText')}
              />

              <Textarea
                label="Description"
                placeholder="Awarded for..."
                {...templateForm.getInputProps('description')}
              />

              <Group grow>
                <Select
                  label="Category"
                  data={[
                    { value: 'achievement', label: 'Achievement' },
                    { value: 'skill', label: 'Skill' },
                    { value: 'spirit', label: 'Spirit' },
                    { value: 'competition', label: 'Competition' },
                    { value: 'special', label: 'Special' },
                  ]}
                  {...templateForm.getInputProps('category')}
                />
                <NumberInput
                  label="XP Value"
                  min={1}
                  max={100}
                  {...templateForm.getInputProps('xpValue')}
                />
              </Group>

              <Divider label="Visual Design" labelPosition="center" />

              <Group grow>
                <Select
                  label="Shape"
                  data={[
                    { value: 'circle', label: 'Circle' },
                    { value: 'star', label: 'Star' },
                    { value: 'shield', label: 'Shield' },
                    { value: 'hexagon', label: 'Hexagon' },
                    { value: 'ribbon', label: 'Ribbon' },
                  ]}
                  {...templateForm.getInputProps('shape')}
                />
                <Select
                  label="Border Style"
                  data={[
                    { value: 'solid', label: 'Solid' },
                    { value: 'double', label: 'Double' },
                    { value: 'ribbon', label: 'Ribbon' },
                  ]}
                  {...templateForm.getInputProps('borderStyle')}
                />
              </Group>

              <ColorInput
                label="Color"
                swatches={['#FFD700', '#C0C0C0', '#CD7F32', '#4169E1', '#32CD32', '#FF6347', '#9370DB']}
                {...templateForm.getInputProps('color')}
              />

              <Divider label="Championship Settings" labelPosition="center" />

              <Switch
                label="Championship Medal"
                description="Only one person can hold this medal at a time. Transfer it to a new champion."
                checked={templateForm.values.isChampionship}
                onChange={(e) => templateForm.setFieldValue('isChampionship', e.currentTarget.checked)}
              />

              {templateForm.values.isChampionship && (
                <Paper p="sm" bg="yellow.0" radius="md">
                  <Group gap="xs">
                    <IconCrown size={16} color="orange" />
                    <Text size="sm" c="yellow.8">
                      When awarded, this medal will be transferred from the current holder to the new champion.
                    </Text>
                  </Group>
                </Paper>
              )}

              <Group justify="flex-end" mt="md">
                <Button variant="subtle" onClick={closeTemplate}>Cancel</Button>
                <Button type="submit">{editingTemplate ? 'Save' : 'Create'}</Button>
              </Group>
            </Stack>
          </Group>
        </form>
      </Modal>

      {/* Create/Edit Goal Modal */}
      <Modal
        opened={goalOpened}
        onClose={closeGoal}
        title={editingGoal ? 'Edit Goal' : 'Create Goal'}
        size="md"
      >
        <form onSubmit={goalForm.onSubmit(handleSaveGoal)}>
          <Stack>
            <TextInput
              label="Title"
              placeholder="e.g., Monthly Attendance"
              required
              {...goalForm.getInputProps('title')}
            />
            <Textarea
              label="Description"
              placeholder="Achieve 90% attendance..."
              {...goalForm.getInputProps('description')}
            />
            <Select
              label="Goal Type"
              data={[
                { value: 'attendance', label: 'Attendance' },
                { value: 'xp', label: 'XP Points' },
                { value: 'streak', label: 'Streak' },
                { value: 'medals', label: 'Medals' },
                { value: 'custom', label: 'Custom' },
              ]}
              {...goalForm.getInputProps('type')}
            />
            <Group grow>
              <NumberInput
                label="Target"
                min={1}
                {...goalForm.getInputProps('target')}
              />
              <Select
                label="Unit"
                data={[
                  { value: 'sessions', label: 'Sessions' },
                  { value: 'points', label: 'Points' },
                  { value: 'days', label: 'Days' },
                  { value: 'count', label: 'Count' },
                ]}
                {...goalForm.getInputProps('unit')}
              />
            </Group>
            <Select
              label="Group (optional)"
              placeholder="All groups"
              data={groups.map(g => ({ value: g.id, label: g.name }))}
              clearable
              {...goalForm.getInputProps('groupId')}
            />
            <Group grow>
              <DateInput
                label="Start Date"
                {...goalForm.getInputProps('startDate')}
              />
              <DateInput
                label="End Date"
                {...goalForm.getInputProps('endDate')}
              />
            </Group>
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={closeGoal}>Cancel</Button>
              <Button type="submit">{editingGoal ? 'Save' : 'Create'}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Award Medal Modal */}
      <Modal
        opened={awardOpened}
        onClose={closeAward}
        title={
          <Group>
            {selectedTemplate?.isChampionship ? <IconCrown size={20} color="orange" /> : <IconTrophy size={20} />}
            <Text fw={500}>
              {selectedTemplate?.isChampionship && selectedTemplate?.currentHolderId
                ? `Transfer: ${selectedTemplate?.name}`
                : `Award: ${selectedTemplate?.name}`}
            </Text>
          </Group>
        }
        size="md"
      >
        <Stack>
          {/* Show medal preview */}
          {selectedTemplate && (
            <Center>
              <MedalGraphic
                name={selectedTemplate.name}
                customText={selectedTemplate.customText}
                color={selectedTemplate.color}
                shape={selectedTemplate.shape}
                borderStyle={selectedTemplate.borderStyle}
                size="md"
                isChampionship={selectedTemplate.isChampionship}
                currentHolderName={selectedTemplate.currentHolderName}
              />
            </Center>
          )}

          {/* Championship transfer notice */}
          {selectedTemplate?.isChampionship && selectedTemplate?.currentHolderId && (
            <Paper p="sm" bg="yellow.0" radius="md">
              <Group gap="xs">
                <IconArrowsExchange size={16} color="orange" />
                <Text size="sm" c="yellow.8">
                  This medal will be transferred from <strong>{selectedTemplate.currentHolderName}</strong> to the new champion.
                </Text>
              </Group>
            </Paper>
          )}

          <Select
            label="Filter by Group"
            description="Select a group to see its students"
            placeholder="Choose a group"
            data={groups.map(g => ({ value: g.id, label: g.name }))}
            value={selectedGroupId}
            onChange={handleGroupSelect}
          />

          {!selectedGroupId && (
            <Paper p="md" bg="gray.0" radius="md" ta="center">
              <Text size="sm" c="dimmed">
                Select a group above to see available students
              </Text>
            </Paper>
          )}

          {selectedGroupId && groupMembers.length === 0 && (
            <Paper p="md" bg="gray.0" radius="md" ta="center">
              <Text size="sm" c="dimmed">
                No students in this group yet
              </Text>
            </Paper>
          )}

          {groupMembers.length > 0 && (
            <>
              <Text size="sm" fw={500}>
                {selectedTemplate?.isChampionship
                  ? 'Select New Champion'
                  : 'Select Student(s) to Award'}
              </Text>
              {selectedTemplate?.isChampionship && (
                <Text size="xs" c="dimmed">
                  Only one person can hold a championship medal
                </Text>
              )}
              <Stack gap="xs">
                {groupMembers.map(member => {
                  const isCurrentHolder = selectedTemplate?.currentHolderId === member.childId;
                  const isSelected = selectedMemberIds.includes(member.childId);

                  return (
                    <Card
                      key={member.childId}
                      withBorder
                      padding="sm"
                      style={{
                        cursor: isCurrentHolder ? 'not-allowed' : 'pointer',
                        backgroundColor: isSelected
                          ? 'var(--mantine-color-blue-0)'
                          : isCurrentHolder
                          ? 'var(--mantine-color-gray-1)'
                          : undefined,
                        borderColor: isSelected
                          ? 'var(--mantine-color-blue-5)'
                          : undefined,
                        opacity: isCurrentHolder ? 0.6 : 1,
                      }}
                      onClick={() => {
                        if (isCurrentHolder) return;

                        if (selectedTemplate?.isChampionship) {
                          // Only allow single selection for championship
                          setSelectedMemberIds(isSelected ? [] : [member.childId]);
                        } else {
                          if (isSelected) {
                            setSelectedMemberIds(selectedMemberIds.filter(id => id !== member.childId));
                          } else {
                            setSelectedMemberIds([...selectedMemberIds, member.childId]);
                          }
                        }
                      }}
                    >
                      <Group>
                        <Avatar color="blue" radius="xl" size="sm">
                          {member.childName[0]}
                        </Avatar>
                        <Text size="sm">{member.childName}</Text>
                        {isCurrentHolder && (
                          <Badge color="yellow" size="sm" ml="auto" leftSection={<IconCrown size={10} />}>
                            Current Holder
                          </Badge>
                        )}
                        {isSelected && !isCurrentHolder && (
                          <Badge color="blue" size="sm" ml="auto">Selected</Badge>
                        )}
                      </Group>
                    </Card>
                  );
                })}
              </Stack>
            </>
          )}

          <TextInput
            label="Reason (optional)"
            placeholder="Why are you giving this award?"
            value={awardReason}
            onChange={(e) => setAwardReason(e.currentTarget.value)}
          />

          <Paper p="sm" bg="gray.0" radius="md">
            <Group justify="space-between">
              <Text size="sm">XP to award:</Text>
              <Text fw={500} c="green">
                +{(selectedTemplate?.xpValue ?? 0) * selectedMemberIds.length} XP
              </Text>
            </Group>
          </Paper>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeAward}>Cancel</Button>
            <Button
              leftSection={
                selectedTemplate?.isChampionship && selectedTemplate?.currentHolderId
                  ? <IconArrowsExchange size={16} />
                  : selectedTemplate?.isChampionship
                  ? <IconCrown size={16} />
                  : <IconTrophy size={16} />
              }
              onClick={handleAwardMedal}
              disabled={!selectedGroupId || selectedMemberIds.length === 0}
              color={selectedTemplate?.isChampionship ? 'yellow' : 'blue'}
            >
              {selectedTemplate?.isChampionship && selectedTemplate?.currentHolderId
                ? 'Transfer Championship'
                : selectedTemplate?.isChampionship
                ? 'Award Championship'
                : `Award to ${selectedMemberIds.length} Member${selectedMemberIds.length !== 1 ? 's' : ''}`}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
