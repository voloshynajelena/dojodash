'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@dojodash/ui/providers';
import { getQueryClient } from '@/lib/queryClient';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
