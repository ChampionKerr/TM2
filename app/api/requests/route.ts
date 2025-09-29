import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { 
  listLeaveRequests,
  createLeaveRequest
} from '@/lib/services/leave-request';

export async function GET(request: NextRequest) {
  try {
    // Input validation
    if (!request.nextUrl) {
      logger.error('Invalid request URL');
      return NextResponse.json(
        { error: 'Invalid request URL' },
        { status: 400 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '0', 10);
    
    logger.info('Processing leave request fetch', { userId, status, page, limit });
    
    const result = await listLeaveRequests(userId ?? undefined, status ?? undefined, page, limit);
    
    if (!result.success) {
      logger.error('Leave request service error', { 
        error: result.error,
        userId,
        stack: new Error().stack
      });
      return NextResponse.json(
        { error: result.error },
        { 
          status: result.error === 'Unauthorized' ? 403 :
                 result.error === 'User not found' ? 404 :
                 500 
        }
      );
    }

    logger.info('Leave requests fetched successfully', { 
      count: Array.isArray(result.data) ? result.data.length : result.data.requests?.length 
    });
    const response = NextResponse.json(result.data);
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET');
    return response;
  } catch (error) {
    logger.error('Unhandled error in leave request API', {
      error,
      userId: request.nextUrl?.searchParams.get('userId'),
      url: request.nextUrl?.toString(),
      stack: new Error().stack
    });
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Input validation
    if (!request.body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (_e) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Request validation
    if (!body.startDate || !body.endDate || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: startDate, endDate, and type are required' },
        { status: 400 }
      );
    }

    // Type validation
    if (typeof body.startDate !== 'string' || typeof body.endDate !== 'string' || typeof body.type !== 'string') {
      return NextResponse.json(
        { error: 'Invalid field types: startDate, endDate must be date strings, and type must be a string' },
        { status: 400 }
      );
    }

    // Date validation
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    const result = await createLeaveRequest(body);

    if (!result.success) {
      logger.error('Failed to create leave request', { error: result.error });
      return NextResponse.json(
        { error: result.error },
        { 
          status: result.error === 'Unauthorized' ? 403 :
                 result.error === 'Start date must be before end date' ? 400 :
                 result.error === 'Start date cannot be in the past' ? 400 :
                 result.error === 'You have overlapping leave requests for these dates' ? 400 :
                 result.error === 'User not found' ? 404 :
                 500
        }
      );
    }

    logger.info('Leave request created successfully', {
      requestId: result.data.id,
      startDate: result.data.startDate,
      endDate: result.data.endDate
    });

    const response = NextResponse.json(result.data, { status: 201 });
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  } catch (error) {
    logger.error('Failed to process leave request creation', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
    const response = NextResponse.json({ error: errorMessage }, { status: 500 });
    // Add CORS headers even for error responses
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  return response;
}
