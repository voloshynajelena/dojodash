import { z } from 'zod';

export const dayOfWeekSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);

export const timeSlotSchema = z.object({
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
});

export const groupScheduleSchema = z.object({
  dayOfWeek: dayOfWeekSchema,
  startTime: timeSlotSchema,
  endTime: timeSlotSchema,
});

export const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  schedule: groupScheduleSchema.optional(),
  maxMembers: z.number().int().min(1).max(100).optional(),
});

export const updateGroupSchema = createGroupSchema.partial();

export const createInviteSchema = z.object({
  groupId: z.string().min(1),
  expiresInDays: z.number().int().min(1).max(30).default(7),
  maxUses: z.number().int().min(1).max(100).default(10),
});

export const claimInviteSchema = z.object({
  code: z.string().min(6).max(20),
  childId: z.string().min(1),
});

export const transferMemberSchema = z.object({
  childId: z.string().min(1),
  fromGroupId: z.string().min(1),
  toGroupId: z.string().min(1),
  reason: z.string().max(200).optional(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type CreateInviteInput = z.infer<typeof createInviteSchema>;
export type ClaimInviteInput = z.infer<typeof claimInviteSchema>;
export type TransferMemberInput = z.infer<typeof transferMemberSchema>;
