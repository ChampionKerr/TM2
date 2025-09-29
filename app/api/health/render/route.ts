// Render Health Check Service
// This service provides comprehensive health monitoring for the Render deployment

import { NextResponse } from 'next/server';

// Check if we're in build mode
const isBuildTime = process.env.IS_BUILD_TIME === 'true' || !process.env.DATABASE_URL || process.env.VERCEL_ENV === 'preview';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  build_mode: boolean;
  services: {
    database: {
      status: 'connected' | 'disconnected';
      responseTime?: number;
      error?: string;
    };
    server: {
      status: 'running';
      uptime: number;
      memory: {
        used: number;
        total: number;
        percentage: number;
      };
    };
    environment: {
      node_env: string;
      render: boolean;
      database_url_configured: boolean;
    };
  };
  version: string;
}

async function checkDatabase(): Promise<HealthCheckResult['services']['database']> {
  // Skip database operations completely during build time
  if (isBuildTime) {
    return {
      status: 'disconnected',
      error: 'Database check skipped during build time'
    };
  }

  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;

    await prisma.$disconnect();

    return {
      status: 'connected',
      responseTime,
    };
  } catch (error) {
    return {
      status: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function getServerStats(): HealthCheckResult['services']['server'] {
  const memUsage = process.memoryUsage();
  
  return {
    status: 'running',
    uptime: process.uptime(),
    memory: {
      used: memUsage.heapUsed,
      total: memUsage.heapTotal,
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    },
  };
}

function getEnvironmentInfo(): HealthCheckResult['services']['environment'] {
  return {
    node_env: process.env.NODE_ENV || 'unknown',
    render: !!process.env.RENDER,
    database_url_configured: !!process.env.DATABASE_URL,
  };
}

export async function GET(): Promise<NextResponse> {
  try {
    // Perform all health checks
    const database = await checkDatabase();
    const server = getServerStats();
    const environment = getEnvironmentInfo();

    // Determine overall health status
    const isHealthy = isBuildTime || database.status === 'connected';

    const healthResult: HealthCheckResult = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      build_mode: isBuildTime,
      services: {
        database,
        server,
        environment,
      },
      version: process.env.npm_package_version || '1.0.0',
    };

    // Log health check for monitoring
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[HEALTH CHECK] ${healthResult.status.toUpperCase()} - ${healthResult.timestamp}`);
      
      if (healthResult.status === 'unhealthy') {
        console.error('[HEALTH CHECK] Issues detected:', {
          database: database.error || 'Unknown database issue',
        });
      }
    }

    // Return appropriate status code
    const statusCode = isBuildTime ? 200 : (isHealthy ? 200 : 503);

    return NextResponse.json(healthResult, {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('[HEALTH CHECK] Unexpected error:', error);

    // Create error response
    const memUsage = process.memoryUsage();
    const errorResult: HealthCheckResult = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      build_mode: isBuildTime,
      services: {
        database: {
          status: 'disconnected',
          error: 'Health check failed',
        },
        server: {
          status: 'running',
          uptime: process.uptime(),
          memory: {
            used: memUsage.heapUsed,
            total: memUsage.heapTotal,
            percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
          },
        },
        environment: getEnvironmentInfo(),
      },
      version: process.env.npm_package_version || '1.0.0',
    };

    return NextResponse.json(errorResult, { status: 503 });
  }
}

// Support HEAD requests for simple health checks
export async function HEAD(): Promise<NextResponse> {
  if (isBuildTime) {
    return new NextResponse(null, { status: 200 });
  }

  try {
    const database = await checkDatabase();
    const isHealthy = database.status === 'connected';
    return new NextResponse(null, { status: isHealthy ? 200 : 503 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}