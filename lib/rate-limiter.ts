import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

const redis = Redis.fromEnv();

class RateLimiter {
  private windowMs = 15 * 60 * 1000; // 15 minutes
  private maxRequests = 100; // limit each IP to 100 requests per windowMs

  async check(request: NextRequest): Promise<void> {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'anonymous';
    const key = `rate-limit:${ip}`;

    const requests = await redis.incr(key);
    if (requests === 1) {
      await redis.expire(key, this.windowMs / 1000);
    }

    if (requests > this.maxRequests) {
      throw new Error('Too many requests');
    }
  }
}

export const rateLimiter = new RateLimiter();
