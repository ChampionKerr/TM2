// API endpoint to fetch team members by department
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      logger.securityEvent('team_access_unauthorized', {
        endpoint: '/api/team/department',
        method: 'GET'
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const department = searchParams.get('dept')

    if (!department) {
      logger.apiRequest(request, 400, {
        endpoint: '/api/team/department',
        method: 'GET',
        userId: session.user.id,
        reason: 'Missing department parameter'
      });
      return NextResponse.json({ error: 'Department parameter is required' }, { status: 400 })
    }

    // Get the current user's information to verify department access
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { department: true, role: true }
    })

    if (!currentUser) {
      logger.securityEvent('user_not_found', {
        userId: session.user.id,
        endpoint: '/api/team/department'
      });
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only allow users to view their own department (unless admin)
    if (session.user.role !== 'admin' && currentUser.department !== department) {
      logger.securityEvent('team_access_denied', {
        userId: session.user.id,
        requestedDepartment: department,
        userDepartment: currentUser.department,
        endpoint: '/api/team/department'
      });
      return NextResponse.json({ error: 'Access denied: Can only view your own department' }, { status: 403 })
    }

    // Fetch team members from the same department
    const teamMembers = await prisma.user.findMany({
      where: {
        department: department,
        id: {
          not: session.user.id
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        role: true,
        vacationDays: true,
        sickDays: true,
      }
    })

    // Calculate used days from leave requests for each member
    const membersWithUsage = await Promise.all(
      teamMembers.map(async (member) => {
        const approvedRequests = await prisma.leaveRequest.findMany({
          where: {
            userId: member.id,
            status: 'Approved'
          }
        })

        const usedVacation = approvedRequests
          .filter(req => req.type === 'Annual')
          .reduce((sum, req) => sum + (req.daysRequested || 0), 0)

        const usedSick = approvedRequests
          .filter(req => req.type === 'Sick')
          .reduce((sum, req) => sum + (req.daysRequested || 0), 0)

        // Check if user is currently on leave
        const today = new Date()
        const currentLeave = await prisma.leaveRequest.findFirst({
          where: {
            userId: member.id,
            status: 'Approved',
            startDate: { lte: today },
            endDate: { gte: today }
          }
        })

        return {
          ...member,
          usedVacation,
          usedSick,
          isOnLeave: !!currentLeave,
          leaveEndDate: currentLeave?.endDate?.toISOString()
        }
      })
    )

    logger.apiRequest(request, 200, {
      endpoint: '/api/team/department',
      method: 'GET',
      userId: session.user.id,
      department: department,
      membersReturned: membersWithUsage.length
    });

    return NextResponse.json({
      success: true,
      members: membersWithUsage,
      department
    })

  } catch (error) {
    logger.apiRequest(request, 500, {
      endpoint: '/api/team/department',
      method: 'GET',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}
