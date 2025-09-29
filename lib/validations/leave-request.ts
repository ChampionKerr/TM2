import { z } from 'zod';
import { LeaveType } from '@/types';

export const leaveRequestValidation = z.object({
  type: z.nativeEnum(LeaveType),
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  endDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must not exceed 500 characters'),
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate']
}).refine(data => {
  const start = new Date(data.startDate);
  return start >= new Date();
}, {
  message: 'Start date cannot be in the past',
  path: ['startDate']
});
