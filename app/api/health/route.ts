import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  responseTime: string
  version: string
  environment: string
  database: {
    status: 'connected' | 'error'
    latency?: number
    users?: number
    requests?: number
  }
  system: {
    nodeVersion: string
    platform: string
    arch: string
    uptime: number
    memory: {
      rss: number
      heapUsed: number
      heapTotal: number
      external: number
    }
  }
  services: {
    email: string
    redis: string
    analytics: string
  }
  checks: {
    database: string
    memory: string
    uptime: string
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  let dbStatus: HealthStatus['database'] = { status: 'error' }
  
  try {
    // Test database connection and get basic stats
    await prisma.$connect()
    const userCount = await prisma.user.count()
    const requestCount = await prisma.leaveRequest.count()
    
    dbStatus = {
      status: 'connected',
      latency: Date.now() - startTime,
      users: userCount,
      requests: requestCount
    }
  } catch (error) {
    logger.error('Health check database connection failed', { error })
  }

  // System information
  const memUsage = process.memoryUsage()
  const systemInfo = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: Math.round(process.uptime()),
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    }
  }

  // Service status
  const services = {
    email: process.env.RESEND_API_KEY ? 'configured' : 'not_configured',
    redis: process.env.REDIS_URL ? 'configured' : 'not_configured',
    analytics: process.env.ENABLE_ANALYTICS === 'true' ? 'enabled' : 'disabled'
  }

  const responseTime = Date.now() - startTime
  const isHealthy = dbStatus.status === 'connected'
  
  // Performance checks
  const checks = {
    database: responseTime < 1000 ? 'pass' : 'slow',
    memory: systemInfo.memory.rss < 512 ? 'pass' : 'warning',
    uptime: systemInfo.uptime > 60 ? 'pass' : 'starting'
  }

  const health: HealthStatus = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    responseTime: `${responseTime}ms`,
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    system: systemInfo,
    services,
    checks
  }

  // Log health check results
  logger.info('Health check performed', {
    status: health.status,
    dbLatency: dbStatus.latency,
    uptime: health.system.uptime,
    responseTime: responseTime
  })

  return NextResponse.json(health, {
    status: health.status === 'healthy' ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
      'Pragma': 'no-cache',
      'X-Health-Check': 'true'
    }
  })
}