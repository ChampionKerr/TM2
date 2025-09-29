import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

// Check if we're in build mode (static generation)
const isBuildTime = process.env.IS_BUILD_TIME === 'true' || !process.env.DATABASE_URL || process.env.VERCEL_ENV === 'preview'

export async function GET(_request: Request) {
  const startTime = Date.now()
  
  // Database health check
  let databaseStatus: 'HEALTHY' | 'FAILED' = 'FAILED'
  let databaseDetails: Record<string, string | number | boolean> = {}
  
  if (isBuildTime) {
    // Skip database operations completely during build
    databaseStatus = 'FAILED'
    databaseDetails = { 
      error: 'Database check skipped during build time',
      build_mode: true
    }
  } else {
    // Only attempt database connection when not in build mode
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      
      await prisma.$connect()
      
      // Test basic queries
      const userCount = await prisma.user.count()
      const requestCount = await prisma.leaveRequest.count()
      
      databaseStatus = 'HEALTHY'
      databaseDetails = {
        userCount,
        requestCount,
        connection: 'active'
      }
      
      await prisma.$disconnect()
      
    } catch (error) {
      logger.error('Health check database connection failed', { error })
      databaseDetails = {
        error: error instanceof Error ? error.message : 'Unknown database error',
        build_mode: false
      }
    }
  }

  // System information
  const memUsage = process.memoryUsage()
  const memoryInfo = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  }

  // Service status
  const services = {
    email: process.env.RESEND_API_KEY ? 'configured' : 'not_configured',
    redis: process.env.REDIS_URL ? 'configured' : 'not_configured',
    analytics: process.env.ENABLE_ANALYTICS === 'true' ? 'enabled' : 'disabled'
  }

  const responseTime = Date.now() - startTime
  
  // During build time, report as healthy even without database
  const overallStatus = isBuildTime ? 'healthy' : (databaseStatus === 'HEALTHY' ? 'healthy' : 'unhealthy')

  const healthReport = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    build_mode: isBuildTime,
    services: {
      database: {
        status: databaseStatus,
        details: databaseDetails
      },
      memory: memoryInfo,
      uptime: process.uptime(),
      external: services
    },
    responseTime: `${responseTime}ms`,
    version: process.env.npm_package_version || '1.0.0'
  }

  // Log health check results
  logger.info('Health check performed', {
    status: overallStatus,
    responseTime,
    database: databaseStatus,
    build_mode: isBuildTime
  })

  // Return appropriate status code - always 200 during build
  const statusCode = isBuildTime ? 200 : (overallStatus === 'healthy' ? 200 : 503)
  
  return NextResponse.json(
    healthReport,
    { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    }
  )
}