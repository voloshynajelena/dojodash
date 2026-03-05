'use client';

import { Badge } from '@mantine/core';
import { IconCheck, IconX, IconClock, IconAlertCircle } from '@tabler/icons-react';
import type { AttendanceStatus } from '@dojodash/core/models';

export interface AttendanceStatusBadgeProps {
  status: AttendanceStatus;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const statusConfig: Record<
  AttendanceStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  present: {
    label: 'Present',
    color: 'green',
    icon: <IconCheck size={12} />,
  },
  absent: {
    label: 'Absent',
    color: 'red',
    icon: <IconX size={12} />,
  },
  excused: {
    label: 'Excused',
    color: 'orange',
    icon: <IconAlertCircle size={12} />,
  },
  late: {
    label: 'Late',
    color: 'yellow',
    icon: <IconClock size={12} />,
  },
};

export function AttendanceStatusBadge({ status, size = 'sm' }: AttendanceStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      size={size}
      color={config.color}
      leftSection={config.icon}
      variant="light"
    >
      {config.label}
    </Badge>
  );
}
