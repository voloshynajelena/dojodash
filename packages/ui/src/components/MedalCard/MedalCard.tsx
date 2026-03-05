'use client';

import { Card, Group, Text, Badge, Stack, Avatar, Tooltip } from '@mantine/core';
import { IconMedal } from '@tabler/icons-react';
import type { Medal, MedalCategory } from '@dojodash/core/models';

export interface MedalCardProps {
  medal: Medal;
  showRecipient?: boolean;
  recipientName?: string;
  onClick?: () => void;
}

const categoryLabels: Record<MedalCategory, string> = {
  achievement: 'Achievement',
  skill: 'Skill',
  spirit: 'Spirit',
  competition: 'Competition',
  special: 'Special',
};

const categoryColors: Record<MedalCategory, string> = {
  achievement: 'green',
  skill: 'blue',
  spirit: 'violet',
  competition: 'orange',
  special: 'yellow',
};

export function MedalCard({ medal, showRecipient, recipientName, onClick }: MedalCardProps) {
  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <Group wrap="nowrap">
        <Avatar
          size="lg"
          radius="xl"
          color={medal.color}
          src={medal.iconURL}
        >
          <IconMedal size={24} />
        </Avatar>

        <Stack gap="xs" style={{ flex: 1 }}>
          <Group justify="space-between" wrap="nowrap">
            <Text fw={600} size="sm" lineClamp={1}>
              {medal.name}
            </Text>
            <Badge size="sm" color={categoryColors[medal.category]}>
              {categoryLabels[medal.category]}
            </Badge>
          </Group>

          {medal.description && (
            <Text size="xs" c="dimmed" lineClamp={2}>
              {medal.description}
            </Text>
          )}

          <Group gap="xs">
            <Badge size="xs" variant="light" color="cyan">
              +{medal.xpValue} XP
            </Badge>
            {showRecipient && recipientName && (
              <Text size="xs" c="dimmed">
                Awarded to {recipientName}
              </Text>
            )}
          </Group>
        </Stack>
      </Group>
    </Card>
  );
}
