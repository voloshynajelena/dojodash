import { z } from 'zod';
import { dayOfWeekSchema, timeSlotSchema } from './group.schema';

export const sessionStatusSchema = z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']);

export const createSessionSchema = z.object({
  groupId: z.string().min(1),
  title: z.string().max(100).optional(),
  date: z.date(),
  startTime: timeSlotSchema,
  endTime: timeSlotSchema,
  notes: z.string().max(1000).optional(),
});

export const updateSessionSchema = createSessionSchema.partial().omit({ groupId: true });

export const cancelSessionSchema = z.object({
  sessionId: z.string().min(1),
  reason: z.string().max(500).optional(),
  notifyFamilies: z.boolean().default(true),
});

export const createRecurrenceSchema = z.object({
  groupId: z.string().min(1),
  dayOfWeek: dayOfWeekSchema,
  startTime: timeSlotSchema,
  endTime: timeSlotSchema,
  startDate: z.date(),
  endDate: z.date().optional(),
  title: z.string().max(100).optional(),
});

export const updateRecurrenceSchema = createRecurrenceSchema.partial().omit({ groupId: true });

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type CancelSessionInput = z.infer<typeof cancelSessionSchema>;
export type CreateRecurrenceInput = z.infer<typeof createRecurrenceSchema>;
export type UpdateRecurrenceInput = z.infer<typeof updateRecurrenceSchema>;
