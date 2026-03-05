import { z } from 'zod';

export const goalTypeSchema = z.enum(['attendance', 'xp', 'streak', 'medals', 'custom']);
export const goalUnitSchema = z.enum(['sessions', 'points', 'days', 'count']);
export const goalStatusSchema = z.enum(['active', 'completed', 'failed', 'cancelled']);

export const createGoalSchema = z.object({
  groupId: z.string().optional(),
  childId: z.string().optional(),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: goalTypeSchema,
  target: z.number().int().min(1),
  unit: goalUnitSchema,
  startDate: z.date(),
  endDate: z.date(),
}).refine(
  (data) => data.endDate > data.startDate,
  { message: 'End date must be after start date', path: ['endDate'] }
);

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  target: z.number().int().min(1).optional(),
  endDate: z.date().optional(),
  status: goalStatusSchema.optional(),
});

export const updateGoalProgressSchema = z.object({
  goalId: z.string().min(1),
  childId: z.string().min(1),
  increment: z.number().int(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type UpdateGoalProgressInput = z.infer<typeof updateGoalProgressSchema>;
