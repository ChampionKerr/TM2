import { PrismaClient } from '@prisma/client';

interface GlobalForPrisma {
  prisma: PrismaClient | undefined;
}

declare const globalThis: GlobalForPrisma & typeof global;

// Check if we're in build mode to avoid database connections
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' ||
                    (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) ||
                    process.env.VERCEL_ENV === 'preview' ||
                    // Only during actual build/compile time, not runtime
                    (typeof process !== 'undefined' && process.argv?.some(arg => arg.includes('next-server'))) ||
                    // Additional detection: Check if we're being called from Next.js static generation
                    (typeof process !== 'undefined' && process.env.__NEXT_PRIVATE_PREBUNDLED_REACT === 'next');

// Render-specific database configuration
const getDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL;
  
  if (!baseUrl) {
    if (isBuildTime) {
      // During build time, return a dummy URL to avoid errors
      return 'postgresql://dummy:dummy@localhost:5432/dummy';
    }
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  // Add SSL configuration for Render PostgreSQL
  if (process.env.RENDER === 'true') {
    // Render requires SSL connections with connection pooling
    const url = new URL(baseUrl);
    url.searchParams.set('sslmode', 'require');
    url.searchParams.set('connection_limit', '5'); // Free tier limit
    url.searchParams.set('pool_timeout', '20');
    return url.toString();
  }
  
  return baseUrl;
};

// Create Prisma client with build-time safety
let prismaInstance: PrismaClient | null = null;

export const prisma = globalThis.prisma || (() => {
  if (isBuildTime) {
    // During build time, create a mock Prisma client that won't connect
    return new Proxy({} as PrismaClient, {
      get() {
        // Silently return undefined for build time - prevents build warnings
        return () => Promise.resolve(undefined);
      }
    });
  }
  
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      datasources: {
        db: {
          url: getDatabaseUrl(),
        },
      },
      // Optimize for Render's connection limits
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  
  return prismaInstance;
})();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Graceful shutdown for Render
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
