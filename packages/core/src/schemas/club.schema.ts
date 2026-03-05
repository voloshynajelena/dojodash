import { z } from 'zod';

export const clubAddressSchema = z.object({
  street: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().min(1).max(20),
  country: z.string().min(1).max(100),
});

export const clubContactSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().max(30).optional(),
  website: z.string().url().optional(),
});

export const clubSettingsSchema = z.object({
  xpPerSession: z.number().int().min(1).max(1000),
  streakBonusXP: z.number().int().min(0).max(500),
  defaultSessionDurationMinutes: z.number().int().min(15).max(480),
  enableMedals: z.boolean(),
  enableGoals: z.boolean(),
  enableLeaderboard: z.boolean(),
});

export const createClubSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  timezone: z.string().min(1),
  address: clubAddressSchema.optional(),
  contact: clubContactSchema.optional(),
  settings: clubSettingsSchema.optional(),
});

export const updateClubSchema = createClubSchema.partial().omit({ slug: true });

export type CreateClubInput = z.infer<typeof createClubSchema>;
export type UpdateClubInput = z.infer<typeof updateClubSchema>;
