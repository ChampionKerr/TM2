import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/analytics/dashboard - Get dashboard analytics
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.sub as string;
    const userRole = token.role as string;

    logger.info('Dashboard analytics request', {
      userId,
      userRole,
      timestamp: new Date().toISOString()
    });

    if (userRole === 'admin') {
      // Admin analytics
      const [
        totalUsers,
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        recentRequests,
        departmentStats,
        monthlyStats
      ] = await Promise.all([
        prisma.user.count(),
        prisma.leaveRequest.count(),
        prisma.leaveRequest.count({ where: { status: 'Pending' } }),
        prisma.leaveRequest.count({ where: { status: 'Approved' } }),
        prisma.leaveRequest.count({ where: { status: 'Rejected' } }),
        prisma.leaveRequest.findMany({
          take: 10,
          orderBy: { requestedAt: 'desc' },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                department: true
              }
            }
          }
        }),
        // Department-wise statistics
        prisma.user.groupBy({
          by: ['department'],
          _count: { id: true },
          where: {
            department: { not: null }
          }
        }),
        // Monthly request statistics
        prisma.$queryRaw`
          SELECT 
            EXTRACT(MONTH FROM "requestedAt") as month,
            EXTRACT(YEAR FROM "requestedAt") as year,
            COUNT(*) as count,
            status
          FROM "leave_requests" 
          WHERE "requestedAt" >= NOW() - INTERVAL '12 months'
          GROUP BY EXTRACT(MONTH FROM "requestedAt"), EXTRACT(YEAR FROM "requestedAt"), status
          ORDER BY year DESC, month DESC
        `
      ]);

      // Calculate trends (simplified)
      const previousMonthRequests = await prisma.leaveRequest.count({
        where: {
          requestedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      });

      const currentMonthRequests = await prisma.leaveRequest.count({
        where: {
          requestedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      });

      const requestTrend = previousMonthRequests > 0 
        ? ((currentMonthRequests - previousMonthRequests) / previousMonthRequests) * 100 
        : 0;

      return NextResponse.json({
        overview: {
          totalUsers,
          totalRequests,
          pendingRequests,
          approvedRequests,
          rejectedRequests
        },
        trends: {
          requests: {
            value: Math.abs(requestTrend),
            direction: requestTrend > 0 ? 'up' : requestTrend < 0 ? 'down' : 'neutral'
          }
        },
        recentActivity: recentRequests.map((request: any) => ({
          id: request.id,
          type: 'request_submitted',
          title: `${request.user.firstName} ${request.user.lastName} submitted a ${request.type} leave request`,
          description: `${request.type} leave from ${request.startDate.toISOString().split('T')[0]} to ${request.endDate.toISOString().split('T')[0]}`,
          timestamp: request.requestedAt.toISOString(),
          status: request.status,
          actor: {
            name: `${request.user.firstName} ${request.user.lastName}`
          }
        })),
        departmentStats: departmentStats.map((dept: any) => ({
          department: dept.department,
          count: dept._count.id
        })),
        monthlyStats
      });
    } else {
      // User analytics
      const [
        userRequests,
        userStats,
        recentRequests,
        leaveBalance
      ] = await Promise.all([
        prisma.leaveRequest.count({ where: { userId } }),
        prisma.leaveRequest.groupBy({
          by: ['status'],
          _count: { id: true },
          where: { userId }
        }),
        prisma.leaveRequest.findMany({
          where: { userId },
          take: 5,
          orderBy: { requestedAt: 'desc' }
        }),
        // TODO: Implement leave balance calculation
        Promise.resolve({ annual: 20, sick: 14, used: { annual: 5, sick: 2 } })
      ]);

      const currentYear = new Date().getFullYear();
      const thisYearRequests = await prisma.leaveRequest.count({
        where: {
          userId,
          requestedAt: {
            gte: new Date(currentYear, 0, 1),
            lt: new Date(currentYear + 1, 0, 1)
          }
        }
      });

      return NextResponse.json({
        overview: {
          totalRequests: userRequests,
          thisYearRequests,
          pendingRequests: userStats.find((s: any) => s.status === 'Pending')?._count.id || 0,
          approvedRequests: userStats.find((s: any) => s.status === 'Approved')?._count.id || 0
        },
        leaveBalance,
        recentActivity: recentRequests.map((request: any) => ({
          id: request.id,
          type: 'request_submitted',
          title: `${request.type} leave request`,
          description: `${request.type} leave from ${request.startDate.toISOString().split('T')[0]} to ${request.endDate.toISOString().split('T')[0]}`,
          timestamp: request.createdAt.toISOString(),
          status: request.status
        }))
      });
    }
  } catch (error) {
    logger.error('Dashboard analytics error', { error });
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}