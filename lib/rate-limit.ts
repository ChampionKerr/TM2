import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis connection (uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Rate limiters for different endpoints
export const authRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 minutes
  analytics: true,
  prefix: 'ratelimit:auth',
});

export const passwordResetRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'), // 3 attempts per hour
  analytics: true,
  prefix: 'ratelimit:password-reset',
});

export const apiRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
  prefix: 'ratelimit:api',
});

/**
 * Check rate limit for a given key
 * Returns { success: boolean, remaining: number, resetTime: number }
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  key: string
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  try {
    const result = await limiter.limit(key);
    return {
      success: result.success,
      remaining: result.remaining,
      resetTime: Date.now() + 60000, // Reset in 1 minute (default window)
    };
  } catch (_error) {
    // Fail open: allow request if Redis is unavailable
    return {
      success: true,
      remaining: 999,
      resetTime: Date.now() + 60000,
    };
  }
}

/**
 * Extract IP from request (handles proxies and load balancers)
 */
export function getClientIP(request: Request): string {
  // Check common proxy headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('cf-connecting-ip');

  // Return first IP from x-forwarded-for if available, otherwise use other headers
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (clientIP) {
    return clientIP;
  }

  // Fallback to localhost (should not happen in production)
  return '127.0.0.1';
}
