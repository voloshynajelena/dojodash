'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Text, Card, Stack, Group, Badge, Button, Loader, Center } from '@mantine/core';
import { IconBell, IconCheck, IconCalendar, IconTrophy, IconUsers } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { EmptyState } from '@dojodash/ui';

interface Notification {
  id: string;
  type: 'session' | 'group' | 'medal' | 'general';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export default function FamilyNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // TODO: Load real notifications from Firestore
    // For now, show empty state for new users
    setLoading(false);
    setNotifications([]);
  }, [user]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'session':
        return <IconCalendar size={24} color="var(--mantine-color-blue-6)" />;
      case 'group':
        return <IconUsers size={24} color="var(--mantine-color-green-6)" />;
      case 'medal':
        return <IconTrophy size={24} color="var(--mantine-color-yellow-6)" />;
      default:
        return <IconBell size={24} color="var(--mantine-color-gray-6)" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <AuthGuard allowedRoles={['FAMILY']}>
        <Container size="md" py="xl">
          <Center h={300}>
            <Loader size="lg" />
          </Center>
        </Container>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={['FAMILY']}>
      <Container size="md" py="xl">
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={2}>Notifications</Title>
            <Text c="dimmed">Updates about your children's activities</Text>
          </div>
          {notifications.length > 0 && (
            <Button variant="subtle">Mark all as read</Button>
          )}
        </Group>

        {notifications.length === 0 ? (
          <EmptyState
            icon={<IconBell size={32} />}
            title="No notifications"
            description="You're all caught up! New notifications will appear here when there are updates about sessions, groups, or medals."
            color="gray"
          />
        ) : (
          <Stack gap="md">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                withBorder
                p="lg"
                opacity={notification.read ? 0.7 : 1}
              >
                <Group justify="space-between">
                  <Group>
                    {getNotificationIcon(notification.type)}
                    <div>
                      <Text fw={500}>{notification.title}</Text>
                      <Text size="sm" c="dimmed">
                        {notification.message}
                      </Text>
                      <Text size="xs" c="dimmed" mt="xs">
                        {formatTime(notification.createdAt)}
                      </Text>
                    </div>
                  </Group>
                  {!notification.read && <Badge color="blue">New</Badge>}
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    </AuthGuard>
  );
}
