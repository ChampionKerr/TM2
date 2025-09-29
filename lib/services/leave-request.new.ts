import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { calculateWorkingDays } from '@/lib/utils/date-utils';

const leaveRequestSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(['Annual', 'Sick', 'Unpaid', 'Other']),
  reason: z.string().max(500).optional(),
});

type CreateLeaveRequestInput = z.infer<typeof leaveRequestSchema>;

interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function listLeaveRequests(userId?: string): Promise<ServiceResult<any>> {
  try {
    logger.info('Starting leave request fetch', { userId });
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      logger.error('No valid session found');
      return { success: false, error: 'Unauthorized' };
    }

    logger.info('Session validated', {
      sessionUserId: session.user.id,
      userRole: session.user.role,
      requestedUserId: userId
    });

    const where = session.user.role === 'admin' 
      ? userId ? { userId } : {}
      : { userId: session.user.id };

    logger.info('Executing leave request query', { where });

    try {
      const requests = await prisma.leaveRequest.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: [
          { requestedAt: 'desc' }
        ],
      });

      logger.info('Leave requests retrieved successfully', {
        count: requests.length,
        sample: requests[0] ? {
          id: requests[0].id,
          userId: requests[0].userId,
          type: requests[0].type,
          status: requests[0].status
        } : null
      });

      return { success: true, data: requests };
    } catch (prismaError) {
      logger.error('Database query failed', { error: prismaError });
      return { 
        success: false, 
        error: prismaError instanceof Error ? prismaError.message : 'Database query failed' 
      };
    }
  } catch (error) {
    logger.error('Unhandled error in listLeaveRequests', { error });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch leave requests' 
    };
  }
}

export async function createLeaveRequest(data: CreateLeaveRequestInput): Promise<ServiceResult<any>> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const validatedData = leaveRequestSchema.parse(data);
    
    // Validate dates
    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    if (startDate > endDate) {
      return { success: false, error: 'Start date must be before end date' };
    }

    // Only validate past dates for non-sick leave
    if (validatedData.type !== 'Sick') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        return { success: false, error: 'Start date cannot be in the past for non-sick leave requests' };
      }
    } else {
      // For sick leave, don't allow dates more than 30 days in the past
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      if (startDate < thirtyDaysAgo) {
        return { success: false, error: 'Sick leave cannot be requested for dates more than 30 days in the past' };
      }
    }

    // Check for overlapping leave requests
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        userId: session.user.id,
        status: { not: 'Rejected' },
        OR: [
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: startDate } },
            ],
          },
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: endDate } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      return { success: false, error: 'You have overlapping leave requests for these dates' };
    }

    // Calculate working days
    const workingDays = calculateWorkingDays(startDate, endDate);

    const request = await prisma.leaveRequest.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        startDate,
        endDate,
        status: 'Pending',
        daysRequested: workingDays,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    logger.info('Leave request created successfully', {
      requestId: request.id,
      startDate: request.startDate,
      endDate: request.endDate
    });

    return { success: true, data: request };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as z.ZodError).format()._errors.join(', ') };
    }
    logger.error('Failed to create leave request', { error });
    return { success: false, error: 'Failed to create leave request' };
  }
}

export async function updateLeaveRequestStatus(
  requestId: string, 
  status: 'Approved' | 'Rejected',
  reason?: string
): Promise<ServiceResult<any>> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const request = await prisma.leaveRequest.update({
      where: { id: requestId },
      data: { 
        status,
        ...(reason && { adminComment: reason }),
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    logger.info('Leave request updated successfully', {
      requestId,
      status,
      reviewedBy: session.user.id
    });

    return { success: true, data: request };
  } catch (error) {
    logger.error('Failed to update leave request', { error });
    return { success: false, error: 'Failed to update leave request' };
  }
}
