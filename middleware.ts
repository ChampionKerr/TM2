import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Simple in-memory rate limiting
const rateLimit = {
  windowMs: 60 * 1000, // 1 minute
  max: 60 // limit each IP to 60 requests per windowMs
};

const ipRequests = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requestData = ipRequests.get(ip);

  if (!requestData || requestData.resetTime < now) {
    ipRequests.set(ip, { count: 1, resetTime: now + rateLimit.windowMs });
    return true;
  }

  if (requestData.count >= rateLimit.max) {
    return false;
  }

  requestData.count++;
  return true;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/* (authentication routes)
     * 2. /_next/static (static files)
     * 3. /_next/image (image optimization files)
     * 4. /favicon.ico (favicon file)
     * 5. /api-docs (Swagger documentation)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|api-docs).*)',
  ],
}

export async function middleware(request: NextRequest) {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === 'production') {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
  }

  // 2. Authentication check for protected routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Skip auth check for auth-related endpoints
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }

    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      const response = NextResponse.next();
      response.headers.set('x-auth-required', '1');
      return response;
    }

    // Check if password reset is required
    if (token.passwordResetRequired && 
        !request.nextUrl.pathname.startsWith('/api/auth/reset-password')) {
      const response = NextResponse.next();
      response.headers.set('x-password-reset-required', '1');
      return response;
    }

    // Add the token to the request headers for the API route
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', token.sub as string);
    requestHeaders.set('x-user-role', token.role as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 3. Check for password reset requirement on page routes
  if (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/employees') ||
      request.nextUrl.pathname.startsWith('/requests')) {
    
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    if (token.passwordResetRequired && 
        !request.nextUrl.pathname.startsWith('/auth/reset-password')) {
      return NextResponse.redirect(new URL('/auth/reset-password', request.url));
    }
  }

  return NextResponse.next();
}
