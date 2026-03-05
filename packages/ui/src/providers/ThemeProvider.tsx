'use client';

import { MantineProvider, type MantineColorScheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '../theme';
import type { ReactNode } from 'react';

export interface ThemeProviderProps {
  children: ReactNode;
  colorScheme?: MantineColorScheme;
}

export function ThemeProvider({ children, colorScheme = 'light' }: ThemeProviderProps) {
  return (
    <MantineProvider theme={theme} defaultColorScheme={colorScheme}>
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  );
}
