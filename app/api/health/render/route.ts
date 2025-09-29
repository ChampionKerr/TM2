// Render Health Check Service
// This service provides comprehensive health monitoring for the Render deployment

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
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
  try {
    if (!prisma) {
      prisma = new PrismaClient();
    }

    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;

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
    node_env: process.env.NODE_ENV || 'development',
    render: process.env.RENDER === 'true',
    database_url_configured: !!process.env.DATABASE_URL,
  };
}

export async function GET(_request: Request): Promise<NextResponse> {
  try {
    const [databaseStatus] = await Promise.all([
      checkDatabase(),
    ]);

    const serverStats = getServerStats();
    const environmentInfo = getEnvironmentInfo();

    const healthResult: HealthCheckResult = {
      status: databaseStatus.status === 'connected' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: databaseStatus,
        server: serverStats,
        environment: environmentInfo,
      },
      version: process.env.npm_package_version || '1.0.0',
    };

    // Log health check for monitoring
    if (process.env.NODE_ENV === 'production') {
      console.log(`[HEALTH CHECK] ${healthResult.status.toUpperCase()} - ${healthResult.timestamp}`);
      
      if (healthResult.status === 'unhealthy') {
        console.error('[HEALTH CHECK] Issues detected:', {
          database: databaseStatus.status !== 'connected' ? 'FAILED' : 'OK',
        });
      }
    }

    // Return appropriate HTTP status
    const httpStatus = healthResult.status === 'healthy' ? 200 : 503;
    
    return NextResponse.json(healthResult, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    
  } catch (error) {
    console.error('[HEALTH CHECK] Unexpected error:', error);
    
    const errorResult: HealthCheckResult = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: 'disconnected',
          error: 'Health check failed',
        },
        server: getServerStats(),
        environment: getEnvironmentInfo(),
      },
      version: process.env.npm_package_version || '1.0.0',
    };

    return NextResponse.json(errorResult, { status: 503 });
  }
}

// Support HEAD requests for simple health checks
export async function HEAD(): Promise<NextResponse> {
  try {
    const databaseStatus = await checkDatabase();
    const httpStatus = databaseStatus.status === 'connected' ? 200 : 503;
    
    return new NextResponse(null, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}