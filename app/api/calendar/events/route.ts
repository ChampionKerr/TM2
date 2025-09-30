import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || '0');
    const year = parseInt(searchParams.get('year') || '0');
    const userId = searchParams.get('userId');
    const includeTeam = searchParams.get('includeTeam') === 'true';

    if (!month || !year || month < 1 || month > 12) {
      return NextResponse.json({ error: 'Valid month and year are required' }, { status: 400 });
    }

    // Create date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    logger.info('Fetching calendar events', {
      month,
      year,
      userId,
      includeTeam,
      dateRange: { startDate, endDate }
    });

    // Build query conditions
    const whereConditions: {
      AND: Array<any>;
      userId?: string;
    } = {
      AND: [
        {
          OR: [
            { startDate: { gte: startDate, lte: endDate } },
            { endDate: { gte: startDate, lte: endDate } },
            {
              AND: [
                { startDate: { lte: startDate } },
                { endDate: { gte: endDate } }
              ]
            }
          ]
        }
      ]
    };

    // Add user/team filtering
    if (session.user.role === 'admin') {
      if (userId) {
        whereConditions.userId = userId;
      } else if (includeTeam) {
        // Admin can see all leave requests
      } else {
        whereConditions.userId = session.user.id;
      }
    } else {
      if (includeTeam) {
        // Regular users can see their department's approved leave
        const currentUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { department: true }
        });

        if (currentUser?.department) {
          whereConditions.AND.push({
            OR: [
              { userId: session.user.id }, // Own requests
              {
                AND: [
                  { status: 'Approved' }, // Only approved requests from others
                  {
                    user: {
                      department: currentUser.department
                    }
                  }
                ]
              }
            ]
          });
        } else {
          whereConditions.userId = session.user.id;
        }
      } else {
        whereConditions.userId = session.user.id;
      }
    }

    // Fetch leave requests
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            department: true,
            role: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    // Transform to calendar events
    const events = leaveRequests.map(request => ({
      id: request.id,
      employeeName: request.userId === session.user.id 
        ? 'You' 
        : `${request.user.firstName} ${request.user.lastName}`,
      type: request.type,
      startDate: request.startDate.toISOString().split('T')[0],
      endDate: request.endDate.toISOString().split('T')[0],
      status: request.status,
      reason: request.reason,
      isCurrentUser: request.userId === session.user.id,
      department: request.user.department,
      daysRequested: request.daysRequested || 1
    }));

    logger.info('Calendar events fetched successfully', {
      eventCount: events.length,
      userRole: session.user.role,
      includeTeam
    });

    return NextResponse.json({
      events,
      month,
      year,
      totalEvents: events.length
    });

  } catch (error) {
    logger.error('Failed to fetch calendar events', { error });
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}