import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

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
    const body = await request.json();
    const { email } = emailSchema.parse(body);

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ 
        message: 'If an account exists with this email, you will receive password reset instructions.' 
      });
    }

    // Generate reset token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION * 60 * 60 * 1000); // 2 hours from now

    // Store reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token, // Use the correct field name from your Prisma schema
        resetTokenExpires: expiresAt,
      },
    });

    // In a real application, send email here
    console.log(`Reset link: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`);

    return NextResponse.json({ 
      message: 'If an account exists with this email, you will receive password reset instructions.' 
    });
  } catch (error) {
    console.error('Password reset request error:', error);
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
        resetToken: token, // Use the correct field name from your Prisma schema
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
        password: hashedPassword, // Use the correct field name from your Prisma schema
        resetToken: null, // Use the correct field name from your Prisma schema
      },
    });

    return NextResponse.json({ message: 'Password reset successful.' });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'An error occurred while resetting your password.' },
      { status: 500 }
    );
  }
}
