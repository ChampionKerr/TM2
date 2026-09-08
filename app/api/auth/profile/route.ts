import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token || !token.sub) {
      logger.securityEvent('profile_access_unauthorized', {
        endpoint: '/api/auth/profile',
        method: 'GET'
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: token.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        company: true,
        department: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      logger.securityEvent('profile_not_found', {
        userId: token.sub,
        endpoint: '/api/auth/profile',
      });
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    logger.apiRequest(request, 200, { endpoint: '/api/auth/profile', method: 'GET', userId: token.sub });
    return NextResponse.json({ user });
  } catch (error) {
    logger.apiRequest(request, 500, { 
      endpoint: '/api/auth/profile',
      method: 'GET',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token || !token.sub) {
      logger.securityEvent('profile_update_unauthorized', {
        endpoint: '/api/auth/profile',
        method: 'PUT'
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, phone, company } = body;

    // Validate input
    if (!firstName || !lastName) {
      logger.apiRequest(request, 400, {
        endpoint: '/api/auth/profile',
        method: 'PUT',
        userId: token.sub,
        reason: 'Missing required fields'
      });
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: token.sub },
      data: {
        firstName,
        lastName,
        phone: phone || null,
        company: company || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        company: true,
        department: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    logger.apiRequest(request, 200, {
      endpoint: '/api/auth/profile',
      method: 'PUT',
      userId: token.sub,
      action: 'profile_updated'
    });

    return NextResponse.json({ user });
  } catch (error) {
    logger.apiRequest(request, 500, {
      endpoint: '/api/auth/profile',
      method: 'PUT',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
