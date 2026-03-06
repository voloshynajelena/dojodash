'use client';

import { useState } from 'react';
import { Container, Title, Text, Card, Stack, TextInput, Button, Group, Divider, PasswordInput, Loader, Center } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/hooks/useAuth';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export default function SettingsPage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  if (!user) {
    return (
      <Center h={300}>
        <Loader size="lg" />
      </Center>
    );
  }

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      // In a real app, you'd update the user profile here
      notifications.show({
        title: 'Success',
        message: 'Profile updated successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update profile',
        color: 'red',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      notifications.show({
        title: 'Error',
        message: 'New passwords do not match',
        color: 'red',
      });
      return;
    }

    if (newPassword.length < 6) {
      notifications.show({
        title: 'Error',
        message: 'Password must be at least 6 characters',
        color: 'red',
      });
      return;
    }

    try {
      setSavingPassword(true);

      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      notifications.show({
        title: 'Success',
        message: 'Password updated successfully',
        color: 'green',
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Failed to update password:', error);
      let message = 'Failed to update password';
      if (error.code === 'auth/wrong-password') {
        message = 'Current password is incorrect';
      } else if (error.code === 'auth/requires-recent-login') {
        message = 'Please log out and log in again to change your password';
      }
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="xs">Account Settings</Title>
      <Text c="dimmed" mb="xl">Manage your account preferences</Text>

      <Stack gap="xl">
        <Card withBorder p="lg">
          <Title order={4} mb="md">Profile</Title>
          <Stack gap="md">
            <TextInput
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <TextInput
              label="Email"
              value={user.email || ''}
              disabled
            />
            <Group justify="flex-end">
              <Button onClick={handleSaveProfile} loading={savingProfile}>
                Save Changes
              </Button>
            </Group>
          </Stack>
        </Card>

        <Card withBorder p="lg">
          <Title order={4} mb="md">Change Password</Title>
          <Stack gap="md">
            <PasswordInput
              label="Current Password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <PasswordInput
              label="Confirm New Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Group justify="flex-end">
              <Button
                onClick={handleChangePassword}
                loading={savingPassword}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                Update Password
              </Button>
            </Group>
          </Stack>
        </Card>

        <Card withBorder p="lg">
          <Title order={4} mb="md">Notifications</Title>
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Notification preferences coming soon.
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
