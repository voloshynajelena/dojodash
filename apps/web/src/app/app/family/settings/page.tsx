'use client';

import { Container, Title, Text, Card, Stack, TextInput, Button, Group, Divider, PasswordInput } from '@mantine/core';

export default function FamilySettingsPage() {
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
              defaultValue="Parent Jones"
            />
            <TextInput
              label="Email"
              defaultValue="family@dojodash.dev"
              disabled
            />
            <Group justify="flex-end">
              <Button>Save Changes</Button>
            </Group>
          </Stack>
        </Card>

        <Card withBorder p="lg">
          <Title order={4} mb="md">Change Password</Title>
          <Stack gap="md">
            <PasswordInput
              label="Current Password"
              placeholder="Enter current password"
            />
            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
            />
            <PasswordInput
              label="Confirm New Password"
              placeholder="Confirm new password"
            />
            <Group justify="flex-end">
              <Button>Update Password</Button>
            </Group>
          </Stack>
        </Card>

        <Card withBorder p="lg">
          <Title order={4} mb="md">Notifications</Title>
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Notification preferences can be configured here.
            </Text>
          </Stack>
        </Card>

        <Divider />

        <Card withBorder p="lg" bg="red.0">
          <Title order={4} mb="md" c="red">Danger Zone</Title>
          <Text size="sm" c="dimmed" mb="md">
            Once you delete your account, there is no going back. Please be certain.
          </Text>
          <Button color="red" variant="outline">Delete Account</Button>
        </Card>
      </Stack>
    </Container>
  );
}
