import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { redis } from '@/lib/cache';

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // 60 requests per minute

export async function rateLimit(request: NextRequest) {
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'anonymous';
  const key = `rate-limit:${ip}`;

  try {
    const currentRequests = await redis.incr(key);
    
    if (currentRequests === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW / 1000);
    }

    if (currentRequests > MAX_REQUESTS) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          retryAfter: RATE_LIMIT_WINDOW / 1000
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(RATE_LIMIT_WINDOW / 1000)
          }
        }
      );
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    return NextResponse.next();
  }
}