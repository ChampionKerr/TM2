import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { LeaveType, LeaveStatus } from '@prisma/client'

interface RouteParams {
  params: Promise<{ requestId: string }>
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { requestId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only admins can use this endpoint
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { type, startDate, endDate, reason, days_requested, status } = body

    // Fetch the existing request
    const existingRequest = await prisma.leaveRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Update the leave request
    const updatedRequest = await prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        type: type || existingRequest.type,
        startDate: startDate ? new Date(startDate) : existingRequest.startDate,
        endDate: endDate ? new Date(endDate) : existingRequest.endDate,
        reason: reason || existingRequest.reason,
        daysRequested: days_requested || existingRequest.daysRequested,
        status: status || existingRequest.status
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    logger.info('Leave request updated by admin', {
      requestId,
      adminId: session.user.id,
      changes: { type, status, days_requested }
    })

    return NextResponse.json(updatedRequest, { status: 200 })
  } catch (error) {
    logger.error('Error updating leave request', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
