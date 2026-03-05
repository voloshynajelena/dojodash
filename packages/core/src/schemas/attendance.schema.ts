import { z } from 'zod';

export const attendanceStatusSchema = z.enum(['present', 'absent', 'excused', 'late']);

export const attendanceRecordSchema = z.object({
  childId: z.string().min(1),
  status: attendanceStatusSchema,
  notes: z.string().max(500).optional(),
});

export const markAttendanceSchema = z.object({
  sessionId: z.string().min(1),
  childId: z.string().min(1),
  status: attendanceStatusSchema,
  notes: z.string().max(500).optional(),
});

export const attendanceBatchSchema = z.object({
  sessionId: z.string().min(1),
  records: z.array(attendanceRecordSchema).min(1),
  deviceId: z.string().optional(),
});

export type AttendanceRecordInput = z.infer<typeof attendanceRecordSchema>;
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
export type AttendanceBatchInput = z.infer<typeof attendanceBatchSchema>;
