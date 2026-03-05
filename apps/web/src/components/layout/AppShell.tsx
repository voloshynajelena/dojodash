'use client';

import { useState } from 'react';
import { AppShell as MantineAppShell, Burger, Group, NavLink, Text, Avatar, Menu, Box, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useRouter, usePathname } from 'next/navigation';
import {
  IconHome,
  IconUsers,
  IconCalendar,
  IconMedal,
  IconTarget,
  IconBell,
  IconSettings,
  IconChevronDown,
  IconLogout,
  IconBuilding,
  IconUserShield,
  IconClipboardList,
  IconChartBar,
} from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@dojodash/core/models';
import type { ReactNode } from 'react';

interface NavItem {
  label: string;
  icon: ReactNode;
  href: string;
}

const adminNavItems: NavItem[] = [
  { label: 'Overview', icon: <IconHome size={20} />, href: '/app/admin' },
  { label: 'Clubs', icon: <IconBuilding size={20} />, href: '/app/admin/clubs' },
  { label: 'Coaches', icon: <IconUserShield size={20} />, href: '/app/admin/coaches' },
  { label: 'Users', icon: <IconUsers size={20} />, href: '/app/admin/users' },
  { label: 'Audit Logs', icon: <IconClipboardList size={20} />, href: '/app/admin/logs' },
];

const coachNavItems: NavItem[] = [
  { label: 'Dashboard', icon: <IconHome size={20} />, href: '/app/coach' },
  { label: 'Club', icon: <IconBuilding size={20} />, href: '/app/coach/club' },
  { label: 'Groups', icon: <IconUsers size={20} />, href: '/app/coach/groups' },
  { label: 'Schedule', icon: <IconCalendar size={20} />, href: '/app/coach/schedule' },
  { label: 'Attendance', icon: <IconClipboardList size={20} />, href: '/app/coach/attendance' },
  { label: 'Medals', icon: <IconMedal size={20} />, href: '/app/coach/medals' },
  { label: 'Goals', icon: <IconTarget size={20} />, href: '/app/coach/goals' },
];

const familyNavItems: NavItem[] = [
  { label: 'Children', icon: <IconUsers size={20} />, href: '/app/family' },
  { label: 'Calendar', icon: <IconCalendar size={20} />, href: '/app/family/calendar' },
  { label: 'Stats', icon: <IconChartBar size={20} />, href: '/app/family/stats' },
  { label: 'Medals', icon: <IconMedal size={20} />, href: '/app/family/medals' },
  { label: 'Notifications', icon: <IconBell size={20} />, href: '/app/family/notifications' },
  { label: 'Settings', icon: <IconSettings size={20} />, href: '/app/family/settings' },
];

function getNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case 'ADMIN':
      return adminNavItems;
    case 'COACH':
      return coachNavItems;
    case 'FAMILY':
      return familyNavItems;
    default:
      return [];
  }
}

export function AppShell({ children }: { children: ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const { user, claims, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = claims ? getNavItems(claims.role) : [];

  return (
    <MantineAppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <MantineAppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text size="xl" fw={700} c="brand">
              DojoDash
            </Text>
          </Group>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <UnstyledButton>
                <Group gap="xs">
                  <Avatar size="sm" radius="xl" color="brand">
                    {user?.displayName?.[0]?.toUpperCase() ?? 'U'}
                  </Avatar>
                  <Box visibleFrom="sm">
                    <Text size="sm" fw={500}>
                      {user?.displayName ?? 'User'}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {claims?.role ?? ''}
                    </Text>
                  </Box>
                  <IconChevronDown size={14} />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconSettings size={14} />}
                onClick={() => router.push('/app/settings')}
              >
                Settings
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconLogout size={14} />}
                onClick={logout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar p="md">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            label={item.label}
            leftSection={item.icon}
            active={pathname === item.href}
            onClick={() => {
              router.push(item.href);
              toggle();
            }}
            style={{ borderRadius: 8 }}
            mb={4}
          />
        ))}
      </MantineAppShell.Navbar>

      <MantineAppShell.Main>{children}</MantineAppShell.Main>
    </MantineAppShell>
  );
}
