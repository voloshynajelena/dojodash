import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  // DAL functions
  getClub,
  updateClub,
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupMembers,
  getSessions,
  createSession,
  updateSession,
  getChildren,
  createChild,
  getChildMedals,
  getMedalTemplates,
  createMedalTemplate,
  getGoals,
  createGoal,
  updateGoal,
  getLeaderboard,
  getNotifications,
  markNotificationRead,
  getAuditLogs,
  getAllClubs,
  // Client functions
  uploadClubLogo,
  createInvite,
  awardOrTransferMedal,
  applyAttendanceBatch,
  adminCreateClub,
  adminCreateCoach,
} from '@dojodash/firebase';
import type {
  Club,
  Group,
  Session,
  Child,
  Medal,
  MedalTemplate,
  Goal,
  Notification,
  LeaderboardEntry,
  AuditLog,
} from '@dojodash/core';

// Query Keys
export const queryKeys = {
  club: (clubId: string) => ['club', clubId] as const,
  clubs: ['clubs'] as const,
  groups: (clubId: string) => ['groups', clubId] as const,
  groupMembers: (clubId: string, groupId: string) => ['groupMembers', clubId, groupId] as const,
  sessions: (clubId: string) => ['sessions', clubId] as const,
  children: (uid: string) => ['children', uid] as const,
  childMedals: (clubId: string, childId: string) => ['childMedals', clubId, childId] as const,
  medalTemplates: (clubId: string) => ['medalTemplates', clubId] as const,
  goals: (clubId: string) => ['goals', clubId] as const,
  leaderboard: (clubId: string, groupId?: string) => ['leaderboard', clubId, groupId] as const,
  notifications: (uid: string) => ['notifications', uid] as const,
  auditLogs: (clubId?: string) => ['auditLogs', clubId] as const,
};

// Club Hooks
export function useClub(clubId: string) {
  return useQuery({
    queryKey: queryKeys.club(clubId),
    queryFn: () => getClub(clubId),
    enabled: !!clubId,
  });
}

export function useClubs() {
  return useQuery({
    queryKey: queryKeys.clubs,
    queryFn: () => getAllClubs(),
  });
}

export function useUpdateClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clubId, data }: { clubId: string; data: Partial<Club> }) =>
      updateClub(clubId, data),
    onSuccess: (_, { clubId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.club(clubId) });
      notifications.show({ title: 'Success', message: 'Club updated', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to update club', color: 'red' });
    },
  });
}

export function useUploadClubLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clubId, file }: { clubId: string; file: File }) =>
      uploadClubLogo(clubId, file),
    onSuccess: (logoURL, { clubId }) => {
      // Update the club with the new logo URL
      updateClub(clubId, { logoURL });
      queryClient.invalidateQueries({ queryKey: queryKeys.club(clubId) });
      notifications.show({ title: 'Success', message: 'Logo uploaded', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to upload logo', color: 'red' });
    },
  });
}

// Groups Hooks
export function useGroups(clubId: string) {
  return useQuery({
    queryKey: queryKeys.groups(clubId),
    queryFn: () => getGroups(clubId),
    enabled: !!clubId,
  });
}

export function useGroupMembers(clubId: string, groupId: string) {
  return useQuery({
    queryKey: queryKeys.groupMembers(clubId, groupId),
    queryFn: () => getGroupMembers(clubId, groupId),
    enabled: !!clubId && !!groupId,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clubId, data }: { clubId: string; data: Parameters<typeof createGroup>[1] }) =>
      createGroup(clubId, data),
    onSuccess: (_, { clubId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups(clubId) });
      notifications.show({ title: 'Success', message: 'Group created', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to create group', color: 'red' });
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clubId,
      groupId,
      data,
    }: {
      clubId: string;
      groupId: string;
      data: Parameters<typeof updateGroup>[2];
    }) => updateGroup(clubId, groupId, data),
    onSuccess: (_, { clubId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups(clubId) });
      notifications.show({ title: 'Success', message: 'Group updated', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to update group', color: 'red' });
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clubId, groupId }: { clubId: string; groupId: string }) =>
      deleteGroup(clubId, groupId),
    onSuccess: (_, { clubId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups(clubId) });
      notifications.show({ title: 'Success', message: 'Group deleted', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to delete group', color: 'red' });
    },
  });
}

export function useCreateInvite() {
  return useMutation({
    mutationFn: createInvite,
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Invite code generated', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to generate invite', color: 'red' });
    },
  });
}

// Sessions Hooks
export function useSessions(clubId: string) {
  return useQuery({
    queryKey: queryKeys.sessions(clubId),
    queryFn: () => getSessions(clubId),
    enabled: !!clubId,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clubId, data }: { clubId: string; data: Parameters<typeof createSession>[1] }) =>
      createSession(clubId, data),
    onSuccess: (_, { clubId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions(clubId) });
      notifications.show({ title: 'Success', message: 'Session created', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to create session', color: 'red' });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clubId,
      sessionId,
      data,
    }: {
      clubId: string;
      sessionId: string;
      data: Parameters<typeof updateSession>[2];
    }) => updateSession(clubId, sessionId, data),
    onSuccess: (_, { clubId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions(clubId) });
      notifications.show({ title: 'Success', message: 'Session updated', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to update session', color: 'red' });
    },
  });
}

// Children Hooks
export function useChildren(uid: string) {
  return useQuery({
    queryKey: queryKeys.children(uid),
    queryFn: () => getChildren(uid),
    enabled: !!uid,
  });
}

export function useCreateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: Parameters<typeof createChild>[1] }) =>
      createChild(uid, data),
    onSuccess: (_, { uid }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.children(uid) });
      notifications.show({ title: 'Success', message: 'Child profile created', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to create child profile', color: 'red' });
    },
  });
}

// Medals Hooks
export function useChildMedals(clubId: string, childId: string) {
  return useQuery({
    queryKey: queryKeys.childMedals(clubId, childId),
    queryFn: () => getChildMedals(clubId, childId),
    enabled: !!clubId && !!childId,
  });
}

export function useMedalTemplates(clubId: string) {
  return useQuery({
    queryKey: queryKeys.medalTemplates(clubId),
    queryFn: () => getMedalTemplates(clubId),
    enabled: !!clubId,
  });
}

export function useCreateMedalTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clubId, data }: { clubId: string; data: Parameters<typeof createMedalTemplate>[1] }) =>
      createMedalTemplate(clubId, data),
    onSuccess: (_, { clubId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medalTemplates(clubId) });
      notifications.show({ title: 'Success', message: 'Medal template created', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to create medal template', color: 'red' });
    },
  });
}

export function useAwardMedal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: awardOrTransferMedal,
    onSuccess: (_, { clubId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medalTemplates(clubId) });
      notifications.show({ title: 'Success', message: 'Medal awarded', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to award medal', color: 'red' });
    },
  });
}

// Goals Hooks
export function useGoals(clubId: string, groupId?: string) {
  return useQuery({
    queryKey: queryKeys.goals(clubId),
    queryFn: () => getGoals(clubId, groupId),
    enabled: !!clubId,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clubId, data }: { clubId: string; data: Parameters<typeof createGoal>[1] }) =>
      createGoal(clubId, data),
    onSuccess: (_, { clubId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals(clubId) });
      notifications.show({ title: 'Success', message: 'Goal created', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to create goal', color: 'red' });
    },
  });
}

// Leaderboard Hooks
export function useLeaderboard(clubId: string, groupId?: string) {
  return useQuery({
    queryKey: queryKeys.leaderboard(clubId, groupId),
    queryFn: () => getLeaderboard({ clubId, groupId, metric: 'xp' }),
    enabled: !!clubId,
  });
}

// Notifications Hooks
export function useNotifications(uid: string) {
  return useQuery({
    queryKey: queryKeys.notifications(uid),
    queryFn: () => getNotifications(uid),
    enabled: !!uid,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, notificationId }: { uid: string; notificationId: string }) =>
      markNotificationRead(uid, notificationId),
    onSuccess: (_, { uid }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(uid) });
    },
  });
}

// Audit Logs Hooks
export function useAuditLogs(clubId?: string) {
  return useQuery({
    queryKey: queryKeys.auditLogs(clubId),
    queryFn: () => getAuditLogs({ clubId, pageSize: 50 }),
  });
}

// Attendance Hooks
export function useApplyAttendanceBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applyAttendanceBatch,
    onSuccess: (_, { clubId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions(clubId) });
      notifications.show({ title: 'Success', message: 'Attendance saved', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to save attendance', color: 'red' });
    },
  });
}

// Admin Hooks
export function useAdminCreateClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminCreateClub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs });
      notifications.show({ title: 'Success', message: 'Club created', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to create club', color: 'red' });
    },
  });
}

export function useAdminCreateCoach() {
  return useMutation({
    mutationFn: adminCreateCoach,
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Coach created', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to create coach', color: 'red' });
    },
  });
}
