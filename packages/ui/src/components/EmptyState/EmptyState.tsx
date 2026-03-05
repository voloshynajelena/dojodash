'use client';

import { Stack, Text, ThemeIcon, Button, type MantineColor } from '@mantine/core';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  color?: MantineColor;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  color = 'gray',
}: EmptyStateProps) {
  return (
    <Stack align="center" gap="md" py="xl">
      <ThemeIcon size={64} radius="xl" variant="light" color={color}>
        {icon}
      </ThemeIcon>

      <Stack align="center" gap={4}>
        <Text size="lg" fw={600} ta="center">
          {title}
        </Text>
        {description && (
          <Text size="sm" c="dimmed" ta="center" maw={300}>
            {description}
          </Text>
        )}
      </Stack>

      {action && (
        <Button variant="light" color={color} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Stack>
  );
}
