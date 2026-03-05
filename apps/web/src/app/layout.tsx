import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@/styles/globals.css';

import { ColorSchemeScript } from '@mantine/core';
import { Providers } from '@/components/providers/Providers';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'DojoDash - Kids Sports Club Management',
  description: 'Manage your kids sports club with attendance tracking, medals, and more.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
