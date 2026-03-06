'use client';

import { Paper, Group, Text, Stack, Badge, ActionIcon, Box } from '@mantine/core';
import {
  IconCalendar,
  IconCalendarX,
  IconCheck,
  IconMedal,
  IconTarget,
  IconTrophy,
  IconStar,
  IconUsers,
  IconMail,
  IconInfoCircle,
  IconCircle,
  IconUserPlus,
  IconUserMinus,
} from '@tabler/icons-react';
import type { Notification, NotificationType } from '@dojodash/core/models';
import { NOTIFICATION_COLORS } from '@dojodash/core/constants';

export interface NotificationItemProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

const typeIcons: Record<NotificationType, React.ReactNode> = {
  session_reminder: <IconCalendar size={20} />,
  session_cancelled: <IconCalendarX size={20} />,
  attendance_marked: <IconCheck size={20} />,
  medal_awarded: <IconMedal size={20} />,
  goal_progress: <IconTarget size={20} />,
  goal_completed: <IconTrophy size={20} />,
  achievement_earned: <IconStar size={20} />,
  group_joined: <IconUsers size={20} />,
  invite_received: <IconMail size={20} />,
  member_joined: <IconUserPlus size={20} />,
  member_left: <IconUserMinus size={20} />,
  system: <IconInfoCircle size={20} />,
};

function formatTime(timestamp: { seconds: number; nanoseconds: number }): string {
  const date = new Date(timestamp.seconds * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

export function NotificationItem({ notification, onMarkRead, onClick }: NotificationItemProps) {
  const color = NOTIFICATION_COLORS[notification.type];

  return (
    <Paper
      p="md"
      radius="md"
      withBorder
      style={{
        cursor: onClick ? 'pointer' : 'default',
        backgroundColor: notification.read ? undefined : 'var(--mantine-color-blue-0)',
      }}
      onClick={() => onClick?.(notification)}
    >
      <Group wrap="nowrap" align="flex-start">
        <Box
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: `var(--mantine-color-${color}-1)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: `var(--mantine-color-${color}-6)`,
            flexShrink: 0,
          }}
        >
          {typeIcons[notification.type]}
        </Box>

        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" wrap="nowrap">
            <Text fw={600} size="sm" lineClamp={1}>
              {notification.title}
            </Text>
            <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
              {formatTime(notification.createdAt)}
            </Text>
          </Group>

          <Text size="sm" c="dimmed" lineClamp={2}>
            {notification.body}
          </Text>
        </Stack>

        {!notification.read && (
          <ActionIcon
            variant="subtle"
            color="blue"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead?.(notification.id);
            }}
          >
            <IconCircle size={12} fill="currentColor" />
          </ActionIcon>
        )}
      </Group>
    </Paper>
  );
}
