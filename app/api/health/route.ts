import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { logger } from '@/lib/logger'

// Create a global Prisma instance to avoid connection issues
const prisma = new PrismaClient()

export async function GET(_request: Request) {
  const startTime = Date.now()
  
  // Database health check
  let databaseStatus: 'HEALTHY' | 'FAILED' = 'FAILED'
  let databaseDetails: any = {}
  
  // Skip database check during build time
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    databaseStatus = 'FAILED'
    databaseDetails = { error: 'Database check skipped during build' }
  } else {
    try {
      await prisma.$connect()
      
      // Test basic query
      const userCount = await prisma.user.count()
      const requestCount = await prisma.leaveRequest.count()
      
      databaseStatus = 'HEALTHY'
      databaseDetails = {
        userCount,
        requestCount,
        connection: 'active'
      }
      
    } catch (error) {
      logger.error('Health check database connection failed', { error })
      databaseDetails = {
        error: error instanceof Error ? error.message : 'Unknown database error'
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
  const overallStatus = databaseStatus === 'HEALTHY' ? 'healthy' : 'unhealthy'

  const healthReport = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
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
    database: databaseStatus
  })

  // Return appropriate status code
  return NextResponse.json(
    healthReport,
    { 
      status: overallStatus === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    }
  )
}