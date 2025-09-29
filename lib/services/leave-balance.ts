import { prisma } from '@/lib/prisma';
import { LeaveType } from '@prisma/client';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export interface LeaveBalance {
  vacationDays: number;
  sickDays: number;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const updateLeaveBalanceSchema = z.object({
  userId: z.string().uuid(),
  leaveType: z.nativeEnum(LeaveType),
  daysToDeduct: z.number().positive(),
});

export async function getUserLeaveBalance(userId: string): Promise<ServiceResult<LeaveBalance>> {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    logger.info('Fetching user leave balance', { userId });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        vacationDays: true,
        sickDays: true,
      },
    });

    if (!user) {
      logger.error('User not found', { userId });
      return { success: false, error: 'User not found' };
    }

    const balance = {
      vacationDays: user.vacationDays,
      sickDays: user.sickDays,
    };

    logger.info('User leave balance retrieved', { userId, balance });
    return { success: true, data: balance };
  } catch (error) {
    logger.error('Failed to get user leave balance', { userId, error });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get user leave balance' 
    };
  }
}

export async function updateLeaveBalance(
  userId: string,
  leaveType: LeaveType,
  daysToDeduct: number
): Promise<ServiceResult<LeaveBalance>> {
  try {
    // Validate input
    const validatedData = updateLeaveBalanceSchema.parse({ userId, leaveType, daysToDeduct });
    
    logger.info('Starting leave balance update', { 
      userId: validatedData.userId, 
      leaveType: validatedData.leaveType, 
      daysToDeduct: validatedData.daysToDeduct 
    });

    // Get current balance
    const currentBalanceResult = await getUserLeaveBalance(validatedData.userId);
    if (!currentBalanceResult.success || !currentBalanceResult.data) {
      return currentBalanceResult;
    }

    const currentBalance = currentBalanceResult.data;

    // Start transaction
    return await prisma.$transaction(async (tx) => {
      const updateData: { vacationDays?: number; sickDays?: number } = {};

      // Calculate new balance based on leave type
      switch (validatedData.leaveType) {
        case 'Annual':
          if (currentBalance.vacationDays < validatedData.daysToDeduct) {
            const error = `Insufficient vacation days. Available: ${currentBalance.vacationDays}, Required: ${validatedData.daysToDeduct}`;
            logger.error(error, { userId: validatedData.userId });
            return { success: false, error };
          }
          updateData.vacationDays = currentBalance.vacationDays - validatedData.daysToDeduct;
          break;
        case 'Sick':
          if (currentBalance.sickDays < validatedData.daysToDeduct) {
            const error = `Insufficient sick days. Available: ${currentBalance.sickDays}, Required: ${validatedData.daysToDeduct}`;
            logger.error(error, { userId: validatedData.userId });
            return { success: false, error };
          }
          updateData.sickDays = currentBalance.sickDays - validatedData.daysToDeduct;
          break;
        case 'Unpaid':
        case 'Other':
          logger.info('No balance update needed for leave type', { 
            userId: validatedData.userId, 
            leaveType: validatedData.leaveType 
          });
          return { success: true, data: currentBalance };
      }

      // Update the balance in the database
      const updatedUser = await tx.user.update({
        where: { id: validatedData.userId },
        data: updateData,
        select: {
          vacationDays: true,
          sickDays: true,
        },
      });

      const updatedBalance = {
        vacationDays: updatedUser.vacationDays,
        sickDays: updatedUser.sickDays,
      };

      logger.info('Leave balance updated successfully', {
        userId: validatedData.userId,
        oldBalance: currentBalance,
        newBalance: updatedBalance,
        leaveType: validatedData.leaveType,
      });

      return { success: true, data: updatedBalance };
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = (error as z.ZodError).format()._errors.join(', ');
      logger.error('Invalid input data', { error: errorMessage });
      return { success: false, error: errorMessage };
    }

    logger.error('Failed to update leave balance', { 
      userId, 
      leaveType, 
      daysToDeduct, 
      error 
    });

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update leave balance' 
    };
  }
}