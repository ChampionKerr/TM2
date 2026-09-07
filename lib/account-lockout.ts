import { prisma } from './prisma';
import { logger } from './logger';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

/**
 * Check if a user account is locked
 */
export async function isAccountLocked(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lockedUntil: true },
    });

    if (!user?.lockedUntil) {
      return false;
    }

    // Check if lockout has expired
    if (new Date() > user.lockedUntil) {
      // Unlock the account
      await prisma.user.update({
        where: { id: userId },
        data: {
          lockedUntil: null,
          failedLoginAttempts: 0,
        },
      });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error checking account lock status', error as Error);
    return false;
  }
}

/**
 * Record a failed login attempt and lock account if needed
 */
export async function recordFailedLoginAttempt(email: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, failedLoginAttempts: true, lockedUntil: true },
    });

    if (!user) {
      return false;
    }

    const newFailedCount = (user.failedLoginAttempts || 0) + 1;
    const shouldLock = newFailedCount >= MAX_FAILED_ATTEMPTS;

    const updateData: any = {
      failedLoginAttempts: newFailedCount,
      lastFailedLogin: new Date(),
    };

    if (shouldLock) {
      updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
      logger.securityEvent('account_locked', {
        userId: user.id,
        email,
        attemptCount: newFailedCount,
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return shouldLock;
  } catch (error) {
    logger.error('Error recording failed login attempt', error as Error, { email });
    return false;
  }
}

/**
 * Record a successful login and reset failed attempts
 */
export async function recordSuccessfulLogin(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastFailedLogin: null,
        lastSuccessfulLogin: new Date(),
      },
    });

    logger.authEvent('login_success', userId);
  } catch (error) {
    logger.error('Error recording successful login', error as Error, { userId });
  }
}

/**
 * Get remaining lockout time in seconds (0 if not locked)
 */
export async function getRemainingLockoutTime(userId: string): Promise<number> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lockedUntil: true },
    });

    if (!user?.lockedUntil) {
      return 0;
    }

    const now = Date.now();
    const lockoutEnd = user.lockedUntil.getTime();

    if (now >= lockoutEnd) {
      return 0;
    }

    return Math.ceil((lockoutEnd - now) / 1000);
  } catch (error) {
    logger.error('Error getting lockout time', error as Error, { userId });
    return 0;
  }
}
