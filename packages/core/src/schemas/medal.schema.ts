import { z } from 'zod';

export const medalCategorySchema = z.enum(['achievement', 'skill', 'spirit', 'competition', 'special']);

export const createMedalTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  xpValue: z.number().int().min(0).max(1000),
  category: medalCategorySchema,
});

export const updateMedalTemplateSchema = createMedalTemplateSchema.partial();

export const awardMedalSchema = z.object({
  templateId: z.string().min(1),
  childIds: z.array(z.string().min(1)).min(1).max(50),
  groupId: z.string().min(1),
  reason: z.string().max(500).optional(),
});

export const transferMedalSchema = z.object({
  medalId: z.string().min(1),
  fromChildId: z.string().min(1),
  toChildId: z.string().min(1),
  reason: z.string().max(500).optional(),
});

export type CreateMedalTemplateInput = z.infer<typeof createMedalTemplateSchema>;
export type UpdateMedalTemplateInput = z.infer<typeof updateMedalTemplateSchema>;
export type AwardMedalInput = z.infer<typeof awardMedalSchema>;
export type TransferMedalInput = z.infer<typeof transferMedalSchema>;
