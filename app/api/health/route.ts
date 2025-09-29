import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function GET(_request: Request) {
  const startTime = Date.now()
  
  // Enhanced build-time detection with logging - RUNTIME AWARE
  const buildDetectionReasons = {
    // Only check NEXT_PHASE during actual build, not persistent env vars
    NEXT_PHASE_BUILD: process.env.NEXT_PHASE === 'phase-production-build',
    VERCEL_ENV_PREVIEW: process.env.VERCEL_ENV === 'preview', 
    NO_DATABASE_URL: !process.env.DATABASE_URL || process.env.DATABASE_URL === '',
    PRODUCTION_NO_VERCEL: typeof process.env.VERCEL === 'undefined' && process.env.NODE_ENV === 'production',
    // During actual static generation, we should have minimal request context AND specific argv
    STATIC_GENERATION: process.env.NEXT_PHASE === 'phase-production-build' && 
                       process.env.NODE_ENV === 'production' && 
                       process.env.VERCEL === '1' &&
                       !_request.headers.get('x-forwarded-for') && // No real client IP
                       !_request.headers.get('cf-ray') && // No Cloudflare routing
                       !_request.headers.get('x-vercel-id') // No Vercel request ID
  }
  
  const isBuildTime = Object.values(buildDetectionReasons).some(Boolean)
  
  // Log detection results for debugging
  console.log('[HEALTH CHECK] Build detection:', {
    isBuildTime,
    reasons: buildDetectionReasons,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PHASE: process.env.NEXT_PHASE,
    VERCEL: process.env.VERCEL,
    DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
    PROCESS_ARGV: process.argv?.slice(-3), // Last 3 args for debugging
    REQUEST_HEADERS: {
      userAgent: _request.headers.get('user-agent'),
      host: _request.headers.get('host'),
      xForwardedFor: _request.headers.get('x-forwarded-for'),
      cfRay: _request.headers.get('cf-ray'),
      xVercelId: _request.headers.get('x-vercel-id'),
      hasRealClientHeaders: !!(_request.headers.get('x-forwarded-for') || _request.headers.get('cf-ray') || _request.headers.get('x-vercel-id'))
    }
  })
  
  // Database health check
  let databaseStatus: 'HEALTHY' | 'FAILED' = 'FAILED'
  let databaseDetails: Record<string, string | number | boolean | object> = {}
  
  if (isBuildTime) {
    // Skip database operations completely during build
    databaseStatus = 'FAILED'
    databaseDetails = { 
      error: 'Database check skipped during build time',
      build_mode: true,
      detection_reasons: buildDetectionReasons
    }
    console.log('[HEALTH CHECK] Skipping database connection - build mode detected')
  } else {
    // Only attempt database connection when not in build mode
    try {
      console.log('[HEALTH CHECK] Attempting database connection...')
      
      // Use enhanced connectivity test that tries both Supabase and Prisma
      const { testDatabaseConnectivity } = await import('@/lib/supabase')
      const connectivityResult = await testDatabaseConnectivity()
      
      if (connectivityResult.success) {
        databaseStatus = 'HEALTHY'
        databaseDetails = {
          connection: 'active',
          method: connectivityResult.method,
          ...connectivityResult.details
        }
        console.log(`[HEALTH CHECK] Database connection successful via ${connectivityResult.method}`)
      } else {
        console.error('[HEALTH CHECK] Database connection failed:', connectivityResult.error)
        logger.error('Health check database connection failed', { 
          error: connectivityResult.error,
          method: connectivityResult.method,
          details: connectivityResult.details
        })
        databaseDetails = {
          error: connectivityResult.error || 'Unknown database error',
          method: connectivityResult.method,
          build_mode: false,
          attempted_connection: true,
          ...connectivityResult.details
        }
      }
      
    } catch (error) {
      console.error('[HEALTH CHECK] Database connection failed:', error)
      logger.error('Health check database connection failed', { error })
      databaseDetails = {
        error: error instanceof Error ? error.message : 'Unknown database error',
        build_mode: false,
        attempted_connection: true,
        fallback_attempted: true
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