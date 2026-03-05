'use client';

import { Paper, Group, Text, Stack, Progress, ThemeIcon, rem } from '@mantine/core';
import type { ReactNode } from 'react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color?: string;
  progress?: {
    value: number;
    label?: string;
  };
  trend?: {
    value: number;
    label: string;
  };
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
  progress,
  trend,
}: StatsCardProps) {
  return (
    <Paper p="md" radius="md" withBorder>
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
            {title}
          </Text>
          <Group gap="xs" align="baseline">
            <Text fw={700} size="xl">
              {value}
            </Text>
            {subtitle && (
              <Text size="sm" c="dimmed">
                {subtitle}
              </Text>
            )}
          </Group>
          {trend && (
            <Text size="xs" c={trend.value >= 0 ? 'teal' : 'red'}>
              {trend.value >= 0 ? '+' : ''}
              {trend.value}% {trend.label}
            </Text>
          )}
        </Stack>

        <ThemeIcon
          size={48}
          radius="md"
          variant="light"
          color={color}
        >
          {icon}
        </ThemeIcon>
      </Group>

      {progress && (
        <Stack gap={4} mt="md">
          <Progress
            value={progress.value}
            color={color}
            size="sm"
            radius="xl"
          />
          {progress.label && (
            <Text size="xs" c="dimmed" ta="right">
              {progress.label}
            </Text>
          )}
        </Stack>
      )}
    </Paper>
  );
}
