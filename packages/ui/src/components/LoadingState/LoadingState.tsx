'use client';

import { Center, Loader, Stack, Text, type MantineColor } from '@mantine/core';

export interface LoadingStateProps {
  message?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: MantineColor;
  fullScreen?: boolean;
}

export function LoadingState({
  message,
  size = 'md',
  color = 'blue',
  fullScreen = false,
}: LoadingStateProps) {
  const content = (
    <Stack align="center" gap="sm">
      <Loader size={size} color={color} />
      {message && (
        <Text size="sm" c="dimmed">
          {message}
        </Text>
      )}
    </Stack>
  );

  if (fullScreen) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        {content}
      </Center>
    );
  }

  return (
    <Center py="xl">
      {content}
    </Center>
  );
}
