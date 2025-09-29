import { z } from 'zod';
import { LeaveType, LeaveStatus } from '@/types';

export const leaveRequestSchema = z.object({
  userId: z.string().uuid(),
  type: z.nativeEnum(LeaveType),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string().min(1).max(500).optional(),
  status: z.nativeEnum(LeaveStatus).optional(),
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: "End date must be after or equal to start date",
});

export const userSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  department: z.string().min(1).max(100).optional(),
  role: z.enum(['admin', 'user']),
});
