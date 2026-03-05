import { z } from 'zod';

export const userRoleSchema = z.enum(['ADMIN', 'COACH', 'FAMILY']);

export const childPrivacySchema = z.object({
  showOnLeaderboard: z.boolean(),
  showFullName: z.boolean(),
  showPhoto: z.boolean(),
});

export const createChildSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  nickname: z.string().max(30).optional(),
  dateOfBirth: z.date(),
  privacy: childPrivacySchema.optional(),
});

export const updateChildSchema = createChildSchema.partial();

export const updateChildPrivacySchema = childPrivacySchema.partial();

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = loginSchema.extend({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(50),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type CreateChildInput = z.infer<typeof createChildSchema>;
export type UpdateChildInput = z.infer<typeof updateChildSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
