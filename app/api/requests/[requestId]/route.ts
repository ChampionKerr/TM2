import { logger } from '@/lib/logger';
import { reviewLeaveRequest, getLeaveRequestById } from '@/lib/services/leave-request';
import { z } from 'zod';
import { LeaveStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { requestId } = params;
    
    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    logger.info('Fetching leave request', { requestId });
    
    const result = await getLeaveRequestById(requestId);

    if (!result.success) {
      const status = getErrorStatusCode(result.error);
      logger.error('Failed to fetch leave request', { 
        requestId,
        error: result.error,
        status
      });

      return NextResponse.json(
        { error: result.error },
        { status }
      );
    }

    logger.info('Leave request fetched successfully', { 
      requestId,
      userId: result.data.userId,
      status: result.data.status
    });

    return NextResponse.json(result.data);
  } catch (error) {
    logger.error('Failed to process leave request fetch', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

const requestSchema = z.object({
  status: z.nativeEnum(LeaveStatus).refine(
    status => status === LeaveStatus.Approved || status === LeaveStatus.Rejected,
    "Status must be either 'Approved' or 'Rejected'"
  ),
  reviewNote: z.string().max(500).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { requestId } = params;
    
    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    logger.info('Processing leave request update', { requestId });

    let body;
    try {
      body = await req.json();
    } catch (e) {
      logger.error('Invalid JSON in request body', { error: e });
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    try {
      const validatedData = requestSchema.parse(body);
      
      const result = await reviewLeaveRequest({
        requestId,
        status: validatedData.status,
        reviewNote: validatedData.reviewNote
      });

      if (!result.success) {
        const status = getErrorStatusCode(result.error);
        logger.error('Failed to update leave request', { 
          requestId,
          error: result.error,
          status
        });

        return NextResponse.json(
          { error: result.error },
          { status }
        );
      }

      logger.info('Leave request updated successfully', {
        requestId,
        status: validatedData.status
      });

      return NextResponse.json(result.data);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errorMessage = validationError.format()._errors.join(', ');
        logger.error('Validation error in request body', { 
          requestId,
          error: errorMessage
        });
        
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    logger.error('Failed to process leave request update', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getErrorStatusCode(error?: string): number {
  if (!error) return 500;
  
  switch (error.toLowerCase()) {
    case 'unauthorized':
      return 403;
    case 'leave request not found':
      return 404;
    case 'can only review pending requests':
      return 409;
    case error.toLowerCase().includes('validation') ? error : '':
      return 400;
    default:
      return 500;
  }
}