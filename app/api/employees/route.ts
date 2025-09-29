import { NextRequest, NextResponse } from 'next/server';
import { listEmployees, createEmployee } from '@/lib/services/employee';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '0', 10);
  
  const result = await listEmployees(page, limit);
  
  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.error === 'Unauthorized' ? 403 : 500 }
    );
  }

  return NextResponse.json(result.data);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createEmployee(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { 
          status: result.error === 'Unauthorized' ? 403 :
                 result.error === 'Email already exists' ? 400 :
                 500
        }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
