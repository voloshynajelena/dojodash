'use client';

import { Box, Text, Stack, Badge, Group } from '@mantine/core';
import { IconCrown, IconArrowsExchange } from '@tabler/icons-react';
import type { MedalShape } from '@dojodash/core/models';

export interface MedalGraphicProps {
  name: string;
  customText?: string;
  color: string;
  shape?: MedalShape | string;
  borderStyle?: 'solid' | 'double' | 'ribbon' | string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | string;
  isChampionship?: boolean;
  currentHolderName?: string;
  onClick?: () => void;
}

const sizeMap = {
  sm: { medal: 60, text: 8, name: 10 },
  md: { medal: 100, text: 11, name: 13 },
  lg: { medal: 140, text: 14, name: 16 },
  xl: { medal: 180, text: 18, name: 20 },
};

function getShapePath(shape: MedalShape, size: number): string {
  const center = size / 2;
  const radius = size / 2 - 4;

  switch (shape) {
    case 'star': {
      const points: string[] = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? radius : radius * 0.5;
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        points.push(`${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`);
      }
      return `M ${points.join(' L ')} Z`;
    }
    case 'shield': {
      return `M ${center} ${4}
              L ${size - 4} ${size * 0.3}
              L ${size - 4} ${size * 0.6}
              Q ${size - 4} ${size - 4} ${center} ${size - 4}
              Q ${4} ${size - 4} ${4} ${size * 0.6}
              L ${4} ${size * 0.3} Z`;
    }
    case 'hexagon': {
      const points: string[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        points.push(`${center + radius * Math.cos(angle)},${center + radius * Math.sin(angle)}`);
      }
      return `M ${points.join(' L ')} Z`;
    }
    case 'ribbon': {
      return `M ${center - radius * 0.8} ${4}
              L ${center + radius * 0.8} ${4}
              L ${center + radius} ${size * 0.15}
              L ${center + radius * 0.8} ${size * 0.3}
              L ${center + radius * 0.8} ${size - 4}
              L ${center} ${size - 15}
              L ${center - radius * 0.8} ${size - 4}
              L ${center - radius * 0.8} ${size * 0.3}
              L ${center - radius} ${size * 0.15}
              L ${center - radius * 0.8} ${4} Z`;
    }
    case 'circle':
    default:
      return '';
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result && result[1] && result[2] && result[3]) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }
  return { r: 255, g: 215, b: 0 };
}

function lightenColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const newR = Math.min(255, Math.round(r + (255 - r) * percent));
  const newG = Math.min(255, Math.round(g + (255 - g) * percent));
  const newB = Math.min(255, Math.round(b + (255 - b) * percent));
  return `rgb(${newR}, ${newG}, ${newB})`;
}

function darkenColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const newR = Math.round(r * (1 - percent));
  const newG = Math.round(g * (1 - percent));
  const newB = Math.round(b * (1 - percent));
  return `rgb(${newR}, ${newG}, ${newB})`;
}

export function MedalGraphic({
  name,
  customText,
  color,
  shape = 'circle',
  borderStyle = 'solid',
  size = 'md',
  isChampionship,
  currentHolderName,
  onClick,
}: MedalGraphicProps) {
  const sizeKey = (size in sizeMap ? size : 'md') as keyof typeof sizeMap;
  const dimensions = sizeMap[sizeKey];
  const medalSize = dimensions.medal;
  const displayText = customText || name;
  const validShape = (['circle', 'star', 'shield', 'hexagon', 'ribbon'].includes(shape as string) ? shape : 'circle') as MedalShape;
  const shapePath = getShapePath(validShape, medalSize);

  const gradientId = `medal-gradient-${Math.random().toString(36).substr(2, 9)}`;
  const lightColor = lightenColor(color, 0.3);
  const darkColor = darkenColor(color, 0.2);

  const getBorderWidth = () => {
    switch (borderStyle) {
      case 'double':
        return 4;
      case 'ribbon':
        return 3;
      default:
        return 2;
    }
  };

  return (
    <Stack
      align="center"
      gap={4}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      {isChampionship && (
        <Badge
          size="xs"
          color="yellow"
          variant="light"
          leftSection={<IconCrown size={10} />}
        >
          Championship
        </Badge>
      )}

      <Box
        style={{
          position: 'relative',
          width: medalSize,
          height: medalSize,
          filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
        }}
      >
        <svg
          width={medalSize}
          height={medalSize}
          viewBox={`0 0 ${medalSize} ${medalSize}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={lightColor} />
              <stop offset="50%" stopColor={color} />
              <stop offset="100%" stopColor={darkColor} />
            </linearGradient>
            <filter id={`${gradientId}-shine`}>
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
              <feOffset in="blur" dx="2" dy="2" result="offsetBlur" />
              <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
            </filter>
          </defs>

          {validShape === 'circle' ? (
            <>
              {/* Outer ring for double border */}
              {borderStyle === 'double' && (
                <circle
                  cx={medalSize / 2}
                  cy={medalSize / 2}
                  r={medalSize / 2 - 2}
                  fill="none"
                  stroke={darkColor}
                  strokeWidth={2}
                />
              )}
              <circle
                cx={medalSize / 2}
                cy={medalSize / 2}
                r={medalSize / 2 - (borderStyle === 'double' ? 8 : 4)}
                fill={`url(#${gradientId})`}
                stroke={darkColor}
                strokeWidth={getBorderWidth()}
              />
              {/* Inner highlight */}
              <circle
                cx={medalSize / 2 - medalSize * 0.15}
                cy={medalSize / 2 - medalSize * 0.15}
                r={medalSize * 0.1}
                fill="rgba(255, 255, 255, 0.4)"
              />
            </>
          ) : (
            <>
              {borderStyle === 'double' && (
                <path
                  d={shapePath}
                  fill="none"
                  stroke={darkColor}
                  strokeWidth={6}
                  transform={`scale(1.05) translate(${-medalSize * 0.025}, ${-medalSize * 0.025})`}
                />
              )}
              <path
                d={shapePath}
                fill={`url(#${gradientId})`}
                stroke={darkColor}
                strokeWidth={getBorderWidth()}
              />
            </>
          )}

          {/* Custom text on medal */}
          <text
            x={medalSize / 2}
            y={medalSize / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill={darkenColor(color, 0.5)}
            fontSize={dimensions.text}
            fontWeight="bold"
            style={{
              textShadow: '0 1px 0 rgba(255,255,255,0.5)',
            }}
          >
            {displayText.length > 12
              ? displayText.slice(0, 10) + '...'
              : displayText}
          </text>
        </svg>

        {/* Ribbon for championship */}
        {isChampionship && validShape !== 'ribbon' && (
          <Box
            style={{
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: medalSize * 0.8,
              height: 16,
              background: `linear-gradient(to bottom, ${color}, ${darkColor})`,
              clipPath: 'polygon(0 0, 100% 0, 90% 100%, 50% 70%, 10% 100%)',
            }}
          />
        )}
      </Box>

      <Text
        size={`${dimensions.name}px`}
        fw={600}
        ta="center"
        lineClamp={1}
        style={{ maxWidth: medalSize * 1.2 }}
      >
        {name}
      </Text>

      {isChampionship && currentHolderName && (
        <Group gap={4}>
          <IconArrowsExchange size={12} color="gray" />
          <Text size="xs" c="dimmed">
            Held by {currentHolderName}
          </Text>
        </Group>
      )}
    </Stack>
  );
}
