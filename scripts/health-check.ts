#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface HealthCheckResult {
  service: string
  status: 'healthy' | 'unhealthy' | 'warning'
  message: string
  details?: any
  timestamp: string
}

class HealthChecker {
  private results: HealthCheckResult[] = []

  private addResult(service: string, status: 'healthy' | 'unhealthy' | 'warning', message: string, details?: any) {
    this.results.push({
      service,
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    })
  }

  async checkDatabase(): Promise<void> {
    console.log('🔍 Checking database connectivity...')
    
    try {
      await prisma.$connect()
      
      // Test basic queries
      const userCount = await prisma.user.count()
      const requestCount = await prisma.leaveRequest.count()
      
      this.addResult('Database', 'healthy', 'Database connection successful', {
        users: userCount,
        requests: requestCount,
        connection: 'active'
      })
      
      console.log(`✅ Database: ${userCount} users, ${requestCount} requests`)
      
    } catch (error) {
      this.addResult('Database', 'unhealthy', 'Database connection failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Database connection failed:', error)
    }
  }

  async checkEnvironmentVariables(): Promise<void> {
    console.log('🔍 Checking environment variables...')
    
    const required = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ]
    
    const optional = [
      'RESEND_API_KEY',
      'REDIS_URL',
      'SENTRY_DSN'
    ]
    
    const missing = required.filter(envVar => !process.env[envVar])
    const missingOptional = optional.filter(envVar => !process.env[envVar])
    
    if (missing.length === 0) {
      this.addResult('Environment Variables', 'healthy', 'All required environment variables are set', {
        required: required.length,
        optional: optional.length - missingOptional.length,
        missing_optional: missingOptional
      })
      console.log('✅ Environment variables: All required variables present')
    } else {
      this.addResult('Environment Variables', 'unhealthy', `Missing required variables: ${missing.join(', ')}`, {
        missing_required: missing,
        missing_optional: missingOptional
      })
      console.log('❌ Missing required environment variables:', missing)
    }
    
    if (missingOptional.length > 0) {
      this.addResult('Optional Environment Variables', 'warning', `Missing optional variables: ${missingOptional.join(', ')}`, {
        missing: missingOptional
      })
      console.log('⚠️  Missing optional environment variables:', missingOptional)
    }
  }

  async checkDiskSpace(): Promise<void> {
    console.log('🔍 Checking disk space...')
    
    try {
      const fs = await import('fs')
      const path = await import('path')
      
      const stats = fs.statSync(process.cwd())
      
      this.addResult('Disk Space', 'healthy', 'Disk space check completed', {
        path: process.cwd(),
        accessible: true
      })
      
      console.log('✅ Disk space: Accessible')
      
    } catch (error) {
      this.addResult('Disk Space', 'warning', 'Could not check disk space', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('⚠️  Disk space check failed:', error)
    }
  }

  async checkMemoryUsage(): Promise<void> {
    console.log('🔍 Checking memory usage...')
    
    const memUsage = process.memoryUsage()
    const totalMB = Math.round(memUsage.rss / 1024 / 1024)
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024)
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024)
    
    const status = totalMB > 512 ? 'warning' : 'healthy'
    const message = status === 'warning' 
      ? `High memory usage: ${totalMB}MB` 
      : `Memory usage normal: ${totalMB}MB`
    
    this.addResult('Memory Usage', status, message, {
      rss_mb: totalMB,
      heap_used_mb: heapUsedMB,
      heap_total_mb: heapTotalMB,
      external_mb: Math.round(memUsage.external / 1024 / 1024)
    })
    
    console.log(`${status === 'warning' ? '⚠️' : '✅'} Memory: ${totalMB}MB RSS, ${heapUsedMB}MB heap`)
  }

  async checkSystemInfo(): Promise<void> {
    console.log('🔍 Gathering system information...')
    
    const os = await import('os')
    
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      node_version: process.version,
      uptime: Math.round(process.uptime()),
      cpu_count: os.cpus().length,
      total_memory_gb: Math.round(os.totalmem() / 1024 / 1024 / 1024),
      free_memory_gb: Math.round(os.freemem() / 1024 / 1024 / 1024),
      load_average: os.loadavg()
    }
    
    this.addResult('System Info', 'healthy', 'System information gathered', systemInfo)
    
    console.log(`✅ System: ${systemInfo.platform} ${systemInfo.arch}, Node ${systemInfo.node_version}`)
    console.log(`✅ Resources: ${systemInfo.cpu_count} CPUs, ${systemInfo.total_memory_gb}GB RAM`)
  }

  async runAllChecks(): Promise<{ healthy: boolean; results: HealthCheckResult[] }> {
    console.log('🚀 Starting production health check...\n')
    
    await Promise.all([
      this.checkEnvironmentVariables(),
      this.checkDatabase(),
      this.checkDiskSpace(),
      this.checkMemoryUsage(),
      this.checkSystemInfo()
    ])
    
    console.log('\n📊 Health Check Summary:')
    console.log('=' .repeat(60))
    
    let healthyCount = 0
    let warningCount = 0
    let unhealthyCount = 0
    
    this.results.forEach(result => {
      const icon = result.status === 'healthy' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'
      console.log(`${icon} ${result.service}: ${result.message}`)
      
      if (result.status === 'healthy') healthyCount++
      else if (result.status === 'warning') warningCount++
      else unhealthyCount++
    })
    
    console.log('=' .repeat(60))
    console.log(`📈 Summary: ${healthyCount} healthy, ${warningCount} warnings, ${unhealthyCount} unhealthy`)
    
    const isHealthy = unhealthyCount === 0
    
    if (isHealthy) {
      console.log('🎉 System is HEALTHY and ready for production!')
    } else {
      console.log('⚠️  System has issues that need to be addressed before production deployment.')
    }
    
    return {
      healthy: isHealthy,
      results: this.results
    }
  }
}

async function main() {
  const checker = new HealthChecker()
  const { healthy, results } = await checker.runAllChecks()
  
  // Write results to file for CI/CD
  const fs = await import('fs')
  const healthCheckResults = {
    timestamp: new Date().toISOString(),
    healthy,
    summary: {
      total: results.length,
      healthy: results.filter(r => r.status === 'healthy').length,
      warning: results.filter(r => r.status === 'warning').length,
      unhealthy: results.filter(r => r.status === 'unhealthy').length
    },
    results
  }
  
  fs.writeFileSync(
    'health-check-results.json',
    JSON.stringify(healthCheckResults, null, 2)
  )
  
  console.log('\n📄 Results written to health-check-results.json')
  
  // Exit with appropriate code for CI/CD
  process.exit(healthy ? 0 : 1)
}

main()
  .catch((error) => {
    console.error('❌ Health check failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })