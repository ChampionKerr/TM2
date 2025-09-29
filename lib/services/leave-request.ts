import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { calculateWorkingDays } from '@/lib/utils/date-utils';
import { LeaveType, LeaveStatus } from '@prisma/client';

const leaveRequestSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.nativeEnum(LeaveType),
  reason: z.string().max(500).optional(),
});

type CreateLeaveRequestInput = z.infer<typeof leaveRequestSchema>;

interface ReviewLeaveRequestInput {
  requestId: string;
  status: LeaveStatus;
  reviewNote?: string;
}

interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getLeaveRequestById(requestId: string): Promise<ServiceResult<any>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      logger.error('No valid session found');
      return { success: false, error: 'Unauthorized' };
    }

    logger.info('Fetching leave request by ID', { requestId });

    const request = await prisma.leaveRequest.findUnique({
      where: { id: requestId },
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

    if (!request) {
      logger.error('Leave request not found', { requestId });
      return { success: false, error: 'Leave request not found' };
    }

    // Check if user is authorized to view this request
    if (session.user.role !== 'admin' && request.userId !== session.user.id) {
      logger.error('Unauthorized access attempt', {
        requestId,
        userId: session.user.id,
        requestUserId: request.userId
      });
      return { success: false, error: 'Unauthorized' };
    }

    logger.info('Leave request retrieved successfully', {
      requestId,
      userId: request.userId,
      type: request.type,
      status: request.status
    });

    return { success: true, data: request };
  } catch (error) {
    logger.error('Failed to fetch leave request', { error, requestId });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch leave request'
    };
  }
}

export async function listLeaveRequests(userId?: string, status?: string, page?: number, limit?: number): Promise<ServiceResult<any>> {
  try {
    logger.info('Starting leave request fetch', { userId, status, page, limit });
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      logger.error('No valid session found');
      return { success: false, error: 'Unauthorized' };
    }

    logger.info('Session validated', {
      sessionUserId: session.user.id,
      userRole: session.user.role,
      requestedUserId: userId,
      statusFilter: status
    });

    const where: any = session.user.role === 'admin' 
      ? userId ? { userId } : {}
      : { userId: session.user.id };

    // Add status filter if provided
    if (status && status !== 'all') {
      where.status = status;
    }

    logger.info('Executing leave request query', { where, page, limit });

    try {
      // Handle pagination
      const isPaginated = page && limit && page > 0 && limit > 0;
      
      if (isPaginated) {
        // Get total count for pagination
        const total = await prisma.leaveRequest.count({ where });
        
        // Calculate skip value (page is 1-based from frontend)
        const skip = (page - 1) * limit;
        
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
          skip,
          take: limit,
        });

        logger.info('Paginated leave requests retrieved successfully', {
          count: requests.length,
          total,
          page,
          limit,
          skip
        });

        return { 
          success: true, 
          data: {
            requests,
            pagination: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit)
            }
          }
        };
      } else {
        // Non-paginated query (original behavior)
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
      }
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
    
    // Validate dates - use local timezone by appending time
    const startDate = new Date(`${validatedData.startDate}T00:00:00`);
    const endDate = new Date(`${validatedData.endDate}T00:00:00`);
    
    if (startDate > endDate) {
      return { success: false, error: 'Start date must be before end date' };
    }

    // Calculate working days
    const workingDays = calculateWorkingDays(startDate, endDate);
    
    logger.info('Processing leave request dates', {
      rawStartDate: validatedData.startDate,
      rawEndDate: validatedData.endDate,
      workingDays,
      type: validatedData.type,
    });

    // Only validate past dates for non-sick leave
    if (validatedData.type !== 'Sick') {
      // Get today's date at midnight in local timezone
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      const todayLocal = new Date(`${todayStr}T00:00:00`);
      
      if (startDate < todayLocal) {
        return { success: false, error: 'Start date cannot be in the past for non-sick leave requests' };
      }
    } else {
      // For sick leave, don't allow dates more than 30 days in the past
      const date = new Date();
      date.setDate(date.getDate() - 30);
      const thirtyDaysAgoStr = date.toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(`${thirtyDaysAgoStr}T00:00:00`);

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

    const request = await prisma.leaveRequest.create({
      data: {
        type: validatedData.type,
        reason: validatedData.reason,
        userId: session.user.id,
        startDate,
        endDate,
        status: LeaveStatus.Pending,
        daysRequested: workingDays,
        requestedAt: new Date(),
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
      userId: session.user.id,
      startDate: request.startDate,
      endDate: request.endDate,
      workingDays
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

export async function reviewLeaveRequest({
  requestId,
  status,
  reviewNote
}: ReviewLeaveRequestInput): Promise<ServiceResult<any>> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    // Get the leave request
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: requestId },
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

    if (!leaveRequest) {
      return { success: false, error: 'Leave request not found' };
    }

    if (leaveRequest.status !== LeaveStatus.Pending) {
      return { success: false, error: 'Can only review pending requests' };
    }

    // Update the leave request
    const result = await prisma.leaveRequest.update({
      where: { id: requestId },
      data: { 
        status,
        reason: reviewNote,
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

    logger.info('Leave request reviewed successfully', {
      requestId,
      status,
      reviewedBy: session.user.id,
      type: result.type
    });

    return { success: true, data: result };
  } catch (error) {
    logger.error('Failed to review leave request', { error });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to review leave request' 
    };
  }
}

export async function updateLeaveRequestStatus(
  requestId: string, 
  status: LeaveStatus, 
  reviewNote?: string
): Promise<ServiceResult<any>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      logger.error('No valid session found');
      return { success: false, error: 'Unauthorized' };
    }

    logger.info('Updating leave request status', { requestId, status });

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: requestId },
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

    if (!leaveRequest) {
      return { success: false, error: 'Leave request not found' };
    }

    if (leaveRequest.status !== LeaveStatus.Pending) {
      return { success: false, error: 'Can only update pending requests' };
    }

    // Update the leave request
    const result = await prisma.leaveRequest.update({
      where: { id: requestId },
      data: { 
        status,
        reason: reviewNote,
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

    logger.info('Leave request status updated successfully', {
      requestId,
      status,
      reviewedBy: session.user.id,
      type: result.type
    });

    return { success: true, data: result };
  } catch (error) {
    logger.error('Failed to update leave request status', { error });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update leave request status' 
    };
  }
}
