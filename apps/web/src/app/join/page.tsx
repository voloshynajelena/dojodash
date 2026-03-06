'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container, Paper, Title, Text, TextInput, Button, Stack, Center,
  Loader, Alert, Card, Group, Avatar, Badge
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconTicket, IconCheck, IconAlertCircle, IconUsers } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { getInviteByCode, getGroup, getClub, addGroupMember, incrementInviteUsedCount, getGroupMembers } from '@dojodash/firebase';
import type { GroupInvite, Group as GroupType, Club } from '@dojodash/core';

function JoinContent() {
  const { user, claims, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get('code');
  const autoJoin = searchParams.get('autojoin') === 'true';

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [invite, setInvite] = useState<GroupInvite | null>(null);
  const [group, setGroup] = useState<GroupType | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [hasAutoJoined, setHasAutoJoined] = useState(false);

  const form = useForm({
    initialValues: {
      code: codeFromUrl || '',
    },
  });

  useEffect(() => {
    if (codeFromUrl) {
      verifyCode(codeFromUrl);
    }
  }, [codeFromUrl]);

  // Auto-join after redirect from login
  useEffect(() => {
    if (autoJoin && user && invite && group && !alreadyMember && !hasAutoJoined && !joined) {
      setHasAutoJoined(true);
      handleJoin();
    }
  }, [autoJoin, user, invite, group, alreadyMember, hasAutoJoined, joined]);

  const verifyCode = async (code: string) => {
    setVerifying(true);
    setError(null);
    setInvite(null);
    setGroup(null);
    setClub(null);
    setAlreadyMember(false);

    try {
      const foundInvite = await getInviteByCode(code.toUpperCase());

      if (!foundInvite) {
        setError('Invalid invite code. Please check and try again.');
        return;
      }

      // Check if expired
      const expiresAt = new Date(foundInvite.expiresAt.seconds * 1000);
      if (expiresAt < new Date()) {
        setError('This invite code has expired.');
        return;
      }

      // Check if max uses reached
      if (foundInvite.usedCount >= foundInvite.maxUses) {
        setError('This invite code has reached its maximum uses.');
        return;
      }

      setInvite(foundInvite);

      // Get group and club info (public data)
      const [groupData, clubData] = await Promise.all([
        getGroup(foundInvite.clubId, foundInvite.groupId),
        getClub(foundInvite.clubId),
      ]);

      setGroup(groupData);
      setClub(clubData);

      // Check if user is already a member (only if logged in - members require auth)
      if (user) {
        try {
          const members = await getGroupMembers(foundInvite.clubId, foundInvite.groupId);
          if (members.some(m => m.childId === user.uid || m.parentUid === user.uid)) {
            setAlreadyMember(true);
          }
        } catch (err) {
          console.warn('Could not check membership status:', err);
        }
      }
    } catch (err: any) {
      console.error('Error verifying code:', err);
      // Show more specific error message
      if (err?.code === 'failed-precondition') {
        setError('Database index is being built. Please try again in a few minutes.');
      } else if (err?.code === 'permission-denied') {
        setError('Permission denied. Please log in and try again.');
      } else {
        setError(`Failed to verify invite code: ${err?.message || 'Unknown error'}`);
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (!values.code.trim()) {
      setError('Please enter an invite code');
      return;
    }
    await verifyCode(values.code.trim());
  };

  const handleJoin = async () => {
    if (!invite || !group || !user) return;

    setLoading(true);
    try {
      // Add the user as a member
      await addGroupMember(invite.clubId, invite.groupId, {
        childId: user.uid,
        childName: user.displayName || user.email || 'Member',
        parentUid: user.uid,
        joinedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
        status: 'active',
      });

      // Increment invite used count
      await incrementInviteUsedCount(invite.clubId, invite.groupId, invite.id);

      setJoined(true);
      notifications.show({
        title: 'Welcome!',
        message: `You've joined ${group.name}`,
        color: 'green',
      });

      // Redirect after a moment
      setTimeout(() => {
        router.push('/app/family');
      }, 2000);
    } catch (err) {
      console.error('Error joining group:', err);
      notifications.show({
        title: 'Error',
        message: 'Failed to join group. Please try again.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Container size="xs" py="xl">
      <Center mb="xl">
        <Stack align="center" gap="xs">
          <IconTicket size={48} color="var(--mantine-color-blue-6)" />
          <Title order={2}>Join a Group</Title>
          <Text c="dimmed" ta="center">
            Enter your invite code to join a training group
          </Text>
        </Stack>
      </Center>

      {joined ? (
        <Card withBorder p="xl" ta="center">
          <IconCheck size={48} color="var(--mantine-color-green-6)" />
          <Title order={3} mt="md">You're In!</Title>
          <Text c="dimmed" mt="xs">
            Welcome to {group?.name}. Redirecting to your dashboard...
          </Text>
          <Loader size="sm" mt="md" />
        </Card>
      ) : invite && group ? (
        <Card withBorder p="xl">
          <Stack>
            <Group>
              <Avatar color={group.color || 'blue'} size="lg" radius="xl">
                {group.name[0]}
              </Avatar>
              <div>
                <Text fw={500} size="lg">{group.name}</Text>
                {club && <Text size="sm" c="dimmed">{club.name}</Text>}
              </div>
            </Group>

            {group.description && (
              <Text size="sm" c="dimmed">{group.description}</Text>
            )}

            <Group gap="xs">
              <Badge variant="light" leftSection={<IconUsers size={12} />}>
                {group.memberCount || 0} members
              </Badge>
            </Group>

            {!user ? (
              <Stack gap="sm">
                <Text size="sm" c="dimmed" ta="center">
                  Create an account or log in to join this group
                </Text>
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/join?code=${invite.code}&autojoin=true`)}`)}
                  leftSection={<IconCheck size={18} />}
                >
                  Sign up to Join {group.name}
                </Button>
                <Text size="xs" c="dimmed" ta="center">
                  Already have an account?{' '}
                  <Text
                    component="a"
                    href={`/login?redirect=${encodeURIComponent(`/join?code=${invite.code}&autojoin=true`)}`}
                    c="blue"
                    style={{ cursor: 'pointer' }}
                  >
                    Log in
                  </Text>
                </Text>
              </Stack>
            ) : alreadyMember ? (
              <Alert color="blue" icon={<IconCheck size={16} />}>
                <Text size="sm">
                  You're already a member of this group!{' '}
                  <Text
                    component="a"
                    href="/app/family"
                    c="blue"
                    style={{ cursor: 'pointer' }}
                  >
                    Go to your dashboard
                  </Text>
                </Text>
              </Alert>
            ) : (
              <Button
                fullWidth
                size="lg"
                onClick={handleJoin}
                loading={loading}
                leftSection={<IconCheck size={18} />}
              >
                Join {group.name}
              </Button>
            )}
          </Stack>
        </Card>
      ) : (
        <Paper withBorder p="xl">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              {error && (
                <Alert color="red" icon={<IconAlertCircle size={16} />}>
                  {error}
                </Alert>
              )}

              <TextInput
                label="Invite Code"
                placeholder="Enter code (e.g., W2NBTS)"
                size="lg"
                styles={{
                  input: {
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    fontWeight: 600,
                    fontSize: '1.5rem',
                  },
                }}
                {...form.getInputProps('code')}
              />

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={verifying}
              >
                Verify Code
              </Button>

              <Text size="xs" c="dimmed" ta="center">
                Get an invite code from your coach or club administrator
              </Text>
            </Stack>
          </form>
        </Paper>
      )}
    </Container>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    }>
      <JoinContent />
    </Suspense>
  );
}
