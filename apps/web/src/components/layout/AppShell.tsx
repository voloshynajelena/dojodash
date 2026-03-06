'use client';

import { useState, useEffect } from 'react';
import { AppShell as MantineAppShell, Burger, Group, NavLink, Text, Avatar, Menu, Box, UnstyledButton, ActionIcon, useMantineColorScheme, Badge, Affix, Transition } from '@mantine/core';
import { useDisclosure, useWindowScroll } from '@mantine/hooks';
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
  IconSun,
  IconMoon,
  IconTrophy,
  IconArrowUp,
} from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToNotifications, getClub, getMemberGroups } from '@dojodash/firebase';
import type { UserRole, Notification, Club } from '@dojodash/core';
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
  { label: 'Groups', icon: <IconChartBar size={20} />, href: '/app/coach/groups' },
  { label: 'Members', icon: <IconUsers size={20} />, href: '/app/coach/members' },
  { label: 'Schedule', icon: <IconCalendar size={20} />, href: '/app/coach/schedule' },
  { label: 'Rewards', icon: <IconTrophy size={20} />, href: '/app/coach/rewards' },
  { label: 'Notifications', icon: <IconBell size={20} />, href: '/app/coach/notifications' },
];

const familyNavItems: NavItem[] = [
  { label: 'Children', icon: <IconUsers size={20} />, href: '/app/family' },
  { label: 'Schedule', icon: <IconCalendar size={20} />, href: '/app/family/schedule' },
  { label: 'Notifications', icon: <IconBell size={20} />, href: '/app/family/notifications' },
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
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [scroll, scrollTo] = useWindowScroll();
  const [unreadCount, setUnreadCount] = useState(0);
  const [clubName, setClubName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToNotifications(user.uid, (notifications) => {
      const unread = notifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const loadClub = async () => {
      try {
        let clubId: string | undefined;

        // Coach has clubIds in claims
        if (claims?.role === 'COACH' && claims?.clubIds?.length) {
          clubId = claims.clubIds[0];
        }
        // Family gets club from their children's group memberships
        else if (claims?.role === 'FAMILY' && user) {
          const memberGroups = await getMemberGroups(user.uid);
          if (memberGroups.length > 0 && memberGroups[0]) {
            clubId = memberGroups[0].clubId;
          }
        }

        if (clubId) {
          const club = await getClub(clubId);
          if (club) {
            setClubName(club.name);
          }
        }
      } catch (error) {
        console.error('Failed to load club:', error);
      }
    };

    if (claims?.role === 'COACH' || claims?.role === 'FAMILY') {
      loadClub();
    }
  }, [claims, user]);

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
            <Group gap="xs">
              <Text size="xl" fw={700} c="brand">
                DojoDash
              </Text>
              {clubName && (claims?.role === 'COACH' || claims?.role === 'FAMILY') && (
                <>
                  <Text size="xl" c="dimmed">-</Text>
                  <Text size="xl" fw={500}>{clubName}</Text>
                </>
              )}
            </Group>
          </Group>

          <Group gap="sm">
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={() => toggleColorScheme()}
              aria-label="Toggle color scheme"
            >
              {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
            </ActionIcon>

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
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar p="md">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            label={
              item.label === 'Notifications' && unreadCount > 0 ? (
                <Group gap="xs">
                  <span>{item.label}</span>
                  <Badge size="xs" color="red" variant="filled" circle>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                </Group>
              ) : (
                item.label
              )
            }
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

      <Affix position={{ bottom: 20, right: 20 }}>
        <Transition transition="slide-up" mounted={scroll.y > 100}>
          {(transitionStyles) => (
            <ActionIcon
              size="lg"
              radius="xl"
              variant="filled"
              style={transitionStyles}
              onClick={() => scrollTo({ y: 0 })}
              aria-label="Scroll to top"
            >
              <IconArrowUp size={18} />
            </ActionIcon>
          )}
        </Transition>
      </Affix>
    </MantineAppShell>
  );
}
