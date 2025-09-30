import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { LeaveType } from '@prisma/client'

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

    const requestId = params.requestId
    const body = await request.json()
    const { type, startDate, endDate, reason, days_requested } = body

    // Fetch the existing request
    const existingRequest = await prisma.leaveRequest.findUnique({
      where: { id: requestId }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Check if user owns this request
    if (existingRequest.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to edit this request' },
        { status: 403 }
      )
    }

    // Only allow editing pending requests
    if (existingRequest.status !== 'Pending') {
      return NextResponse.json(
        { error: 'Only pending requests can be edited' },
        { status: 400 }
      )
    }

    // Update the request
    const updatedRequest = await prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        type: type as LeaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        daysRequested: days_requested,
        // Reset review fields when edited
        reviewedAt: null,
        reviewedBy: null
      }
    })

    logger.info('Leave request updated by user', {
      requestId,
      userId: session.user.id,
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
    logger.error('Error updating leave request', { error })
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    )
  }
}