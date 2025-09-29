import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generateSecurePassword, hashPassword } from '@/lib/password-utils';
import { logger } from '@/lib/logger';
import { sendEmail } from '@/lib/email';
import { WelcomeEmail } from '@/components/emails/WelcomeEmail';
import React from 'react';

const employeeSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  department: z.string().optional(),
  role: z.enum(['admin', 'user']).default('user'),
});

type CreateEmployeeInput = z.infer<typeof employeeSchema>;

interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function listEmployees(page?: number, limit?: number): Promise<ServiceResult<any>> {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Handle pagination
    const isPaginated = page && limit && page > 0 && limit > 0;
    
    if (isPaginated) {
      // Get total count for pagination
      const total = await prisma.user.count();
      
      // Calculate skip value (page is 1-based from frontend)
      const skip = (page - 1) * limit;
      
      const employees = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          department: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      });

      return { 
        success: true, 
        data: {
          employees,
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
      const employees = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          department: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return { success: true, data: { employees } };
    }
  } catch (error) {
    return { success: false, error: 'Failed to fetch employees' };
  }
}

export async function createEmployee(data: CreateEmployeeInput): Promise<ServiceResult<any>> {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const validatedData = employeeSchema.parse(data);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return { success: false, error: 'Email already exists' };
    }

    // Generate a secure random password
    const temporaryPassword = generateSecurePassword();
    const hashedPassword = await hashPassword(temporaryPassword);

    logger.info('Creating new employee', {
      email: validatedData.email,
      firstName: validatedData.firstName,
      role: validatedData.role
    });

    const employee = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
        passwordResetRequired: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
        role: true,
        createdAt: true,
      },
    });

    // Send welcome email with temporary password
    try {
      await sendEmail({
        to: employee.email,
        subject: 'Welcome to Timewise HRMS - Your Account Details',
        react: React.createElement(WelcomeEmail, {
          firstName: employee.firstName,
          email: employee.email,
          temporaryPassword,
        }),
      });

      logger.info('Welcome email sent successfully', { email: employee.email });
    } catch (emailError) {
      logger.error('Failed to send welcome email', { 
        error: emailError, 
        email: employee.email 
      });
      // We don't want to fail the employee creation if email sending fails
    }

    // Return both the employee data and the temporary password
    return { 
      success: true, 
      data: {
        ...employee,
        temporaryPassword, // Include the unhashed temporary password in the response
      }
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as z.ZodError).format()._errors.join(', ') };
    }
    return { success: false, error: 'Failed to create employee' };
  }
}
