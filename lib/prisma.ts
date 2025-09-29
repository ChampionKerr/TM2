import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Render-specific database configuration
const getDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL;
  
  if (!baseUrl) {
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

export const prisma = globalThis.prisma || new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
  // Optimize for Render's connection limits
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

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
