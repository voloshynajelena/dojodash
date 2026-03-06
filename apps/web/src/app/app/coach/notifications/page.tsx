'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Text, Card, Stack, Group, Badge, Button, Loader, Center } from '@mantine/core';
import { IconBell, IconCalendar, IconTrophy, IconUsers, IconUserPlus } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { subscribeToNotifications, markNotificationRead, markAllNotificationsRead } from '@dojodash/firebase';
import type { Notification } from '@dojodash/core';

export default function CoachNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToNotifications(user.uid, (data) => {
      setNotifications(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'session':
        return <IconCalendar size={24} color="var(--mantine-color-blue-6)" />;
      case 'group':
        return <IconUsers size={24} color="var(--mantine-color-green-6)" />;
      case 'medal':
        return <IconTrophy size={24} color="var(--mantine-color-yellow-6)" />;
      case 'member_joined':
        return <IconUserPlus size={24} color="var(--mantine-color-teal-6)" />;
      case 'member_left':
        return <IconUsers size={24} color="var(--mantine-color-orange-6)" />;
      default:
        return <IconBell size={24} color="var(--mantine-color-gray-6)" />;
    }
  };

  const formatTime = (timestamp: { seconds: number; nanoseconds: number } | undefined) => {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp.seconds * 1000);
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

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user) return;
    await markNotificationRead(user.uid, notificationId);
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await markAllNotificationsRead(user.uid);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <AuthGuard allowedRoles={['ADMIN', 'COACH']}>
        <Container size="md" py="xl">
          <Center h={300}>
            <Loader size="lg" />
          </Center>
        </Container>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={['ADMIN', 'COACH']}>
      <Container size="md" py="xl">
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={2}>Notifications</Title>
            <Text c="dimmed">Updates about members and groups</Text>
          </div>
          {unreadCount > 0 && (
            <Button variant="subtle" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Group>

        {notifications.length === 0 ? (
          <Card withBorder p="xl" ta="center">
            <IconBell size={48} color="gray" style={{ opacity: 0.5 }} />
            <Text size="lg" fw={500} mt="md">No notifications</Text>
            <Text size="sm" c="dimmed">
              You'll be notified when new members join, data changes, or other updates occur.
            </Text>
          </Card>
        ) : (
          <Stack gap="md">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                withBorder
                p="lg"
                opacity={notification.read ? 0.7 : 1}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                style={{ cursor: notification.read ? 'default' : 'pointer' }}
              >
                <Group justify="space-between">
                  <Group>
                    {getNotificationIcon(notification.type)}
                    <div>
                      <Text fw={500}>{notification.title}</Text>
                      <Text size="sm" c="dimmed">
                        {notification.body}
                      </Text>
                      <Text size="xs" c="dimmed" mt="xs">
                        {formatTime(notification.createdAt as any)}
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
