import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { passwordResetRateLimit, checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const emailSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

// Token expiration time in hours
const TOKEN_EXPIRATION = 2;

export async function POST(request: Request) {
  try {
    const clientIP = getClientIP(request);
    const rateLimitKey = `password-reset:${clientIP}`;
    
    // Check rate limit
    const rateLimitResult = await checkRateLimit(passwordResetRateLimit, rateLimitKey);
    if (!rateLimitResult.success) {
      logger.securityEvent('rate_limit_exceeded', { 
        endpoint: 'password-reset', 
        ip: clientIP,
        remaining: rateLimitResult.remaining 
      });
      return NextResponse.json(
        { error: 'Too many password reset requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = emailSchema.parse(body);

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Generate reset token
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION * 60 * 60 * 1000); // 2 hours from now

      // Store reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpires: expiresAt,
        },
      });

      logger.securityEvent('password_reset_requested', {
        userId: user.id,
        email: email,
        ip: clientIP,
      });

      // In a real application, send email here
    }

    return NextResponse.json({ 
      message: 'If an account exists with this email, you will receive password reset instructions.' 
    });
  } catch (error) {
    logger.securityEvent('password_reset_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: getClientIP(request),
    });
    return NextResponse.json(
      { error: 'An error occurred while processing your request.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = resetSchema.parse(body);

    // Find user by reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token.' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
      },
    });

    logger.securityEvent('password_reset_completed', {
      userId: user.id,
      email: user.email,
      ip: getClientIP(request),
    });

    return NextResponse.json({ message: 'Password reset successful.' });
  } catch (error) {
    logger.securityEvent('password_reset_completion_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: getClientIP(request),
    });
    return NextResponse.json(
      { error: 'An error occurred while resetting your password.' },
      { status: 500 }
    );
  }
}
