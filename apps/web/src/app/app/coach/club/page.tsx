'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Container, Title, Text, Card, TextInput, Button, Stack, Group,
  ColorInput, NumberInput, Image, FileButton, Loader, Center, Avatar, Select
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconUpload, IconPhoto } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { getClub, updateClub, uploadClubLogo } from '@dojodash/firebase';
import type { Club } from '@dojodash/core';

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'America/Phoenix', label: 'Arizona (No DST)' },
  { value: 'America/Toronto', label: 'Toronto (ET)' },
  { value: 'America/Vancouver', label: 'Vancouver (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Europe/Kyiv', label: 'Kyiv (EET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST)' },
];

export default function CoachClubPage() {
  const { claims } = useAuth();
  const clubId = claims?.clubIds?.[0] || '';

  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      slug: '',
      primaryColor: '#4ECDC4',
      timezone: 'America/New_York',
      xpPerSession: 10,
      streakBonusXP: 5,
    },
  });

  useEffect(() => {
    if (clubId) {
      loadClub();
    } else {
      setLoading(false);
    }
  }, [clubId]);

  const loadClub = async () => {
    try {
      setLoading(true);
      const data = await getClub(clubId);
      if (data) {
        setClub(data);
        setLogoPreview(data.logoURL ?? null);
        form.setValues({
          name: data.name,
          slug: data.slug ?? '',
          primaryColor: data.primaryColor ?? '#4ECDC4',
          timezone: data.timezone ?? 'America/New_York',
          xpPerSession: data.settings?.xpPerSession ?? 10,
          streakBonusXP: data.settings?.streakBonusXP ?? 5,
        });
      }
    } catch (error) {
      console.error('Failed to load club:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load club settings',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (file: File | null) => {
    if (!file) return;

    try {
      setUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Firebase Storage
      const logoURL = await uploadClubLogo(clubId, file);

      // Update club with new logo URL
      await updateClub(clubId, { logoURL });

      notifications.show({
        title: 'Success',
        message: 'Logo uploaded successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to upload logo:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to upload logo',
        color: 'red',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (values: typeof form.values) => {
    try {
      setSaving(true);

      await updateClub(clubId, {
        name: values.name,
        slug: values.slug,
        primaryColor: values.primaryColor,
        timezone: values.timezone,
        settings: {
          defaultSessionDurationMinutes: club?.settings?.defaultSessionDurationMinutes ?? 60,
          enableMedals: club?.settings?.enableMedals ?? true,
          enableGoals: club?.settings?.enableGoals ?? true,
          enableLeaderboard: club?.settings?.enableLeaderboard ?? true,
          xpPerSession: values.xpPerSession,
          streakBonusXP: values.streakBonusXP,
        },
      });

      notifications.show({
        title: 'Success',
        message: 'Club settings saved successfully',
        color: 'green',
      });

      loadClub();
    } catch (error) {
      console.error('Failed to save club settings:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save club settings',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Center h={300}>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  if (!clubId) {
    return (
      <Container size="md" py="xl">
        <Center h={300}>
          <Stack align="center" gap="md">
            <IconPhoto size={48} color="gray" style={{ opacity: 0.5 }} />
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
    <Container size="md" py="xl">
      <Title order={2} mb="xs">Club Settings</Title>
      <Text c="dimmed" mb="xl">Manage your club branding and settings</Text>

      <form onSubmit={form.onSubmit(handleSave)}>
        <Stack gap="xl">
          {/* Logo Upload */}
          <Card withBorder p="lg">
            <Title order={4} mb="md">Club Logo</Title>
            <Group>
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt="Club logo"
                  w={100}
                  h={100}
                  radius="md"
                  fit="cover"
                />
              ) : (
                <Avatar size={100} radius="md" color="gray">
                  <IconPhoto size={40} />
                </Avatar>
              )}
              <Stack gap="xs">
                <FileButton
                  onChange={handleLogoUpload}
                  accept="image/png,image/jpeg,image/webp"
                >
                  {(props) => (
                    <Button
                      {...props}
                      variant="light"
                      leftSection={<IconUpload size={16} />}
                      loading={uploading}
                    >
                      Upload Logo
                    </Button>
                  )}
                </FileButton>
                <Text size="xs" c="dimmed">
                  Recommended: 200x200px, PNG or JPG
                </Text>
              </Stack>
            </Group>
          </Card>

          {/* Basic Info */}
          <Card withBorder p="lg">
            <Title order={4} mb="md">Basic Information</Title>
            <Stack>
              <TextInput
                label="Club Name"
                placeholder="Enter club name"
                required
                {...form.getInputProps('name')}
              />
              <TextInput
                label="Slug"
                description="URL-friendly name"
                placeholder="e.g., demo-dojo"
                {...form.getInputProps('slug')}
              />
              <ColorInput
                label="Primary Color"
                description="Used for branding throughout the app"
                {...form.getInputProps('primaryColor')}
              />
              <Select
                label="Timezone"
                description="Used for scheduling sessions"
                placeholder="Select timezone"
                data={TIMEZONES}
                searchable
                {...form.getInputProps('timezone')}
              />
            </Stack>
          </Card>

          {/* XP Settings */}
          <Card withBorder p="lg">
            <Title order={4} mb="md">XP Settings</Title>
            <Stack>
              <NumberInput
                label="XP per Session"
                description="Points awarded for attending a session"
                min={0}
                max={100}
                {...form.getInputProps('xpPerSession')}
              />
              <NumberInput
                label="Streak Bonus XP"
                description="Extra points for maintaining a streak"
                min={0}
                max={50}
                {...form.getInputProps('streakBonusXP')}
              />
            </Stack>
          </Card>

          <Group justify="flex-end">
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
}
