import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { LeaveType, LeaveStatus } from '@prisma/client'

export async function PUT(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
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

    const requestId = params.requestId
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

    // Prepare update data
    const updateData: {
      type: LeaveType
      startDate: Date
      endDate: Date
      reason: string
      daysRequested: number
      status?: LeaveStatus
      reviewedAt?: Date
      reviewedBy?: string
    } = {
      type: type as LeaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      daysRequested: days_requested
    }

    // If status is being changed, update review fields
    if (status && status !== existingRequest.status) {
      updateData.status = status as LeaveStatus
      updateData.reviewedAt = new Date()
      updateData.reviewedBy = session.user.id
    }

    // Update the request
    const updatedRequest = await prisma.leaveRequest.update({
      where: { id: requestId },
      data: updateData,
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
      originalStatus: existingRequest.status,
      newStatus: status,
      employeeId: existingRequest.userId,
      type,
      startDate,
      endDate,
      daysRequested: days_requested
    })

    return NextResponse.json({
      success: true,
      message: 'Request updated successfully',
      request: updatedRequest
    })

  } catch (error) {
    logger.error('Error updating leave request (admin)', { error })
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    )
  }
}