#!/usr/bin/env npx tsx
/**
 * Enhanced Database Connectivity Test
 * Tests both Prisma and Supabase client connections
 */

// Load environment variables from .env file
import dotenv from 'dotenv'
import path from 'path'

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import { testDatabaseConnectivity, getDatabaseCredentials } from '../lib/supabase'

async function runDatabaseTest() {
  console.log('🔍 Enhanced Database Connectivity Test')
  console.log('=====================================\n')

  // Show database configuration
  try {
    const dbCredentials = getDatabaseCredentials()
    console.log('📊 Database Configuration:')
    console.log(`  Project ID: ${dbCredentials.projectId}`)
    console.log(`  Host: ${dbCredentials.host}`)
    console.log(`  Password: ${dbCredentials.password ? '***' + dbCredentials.password.slice(-4) : 'NOT SET'}`)
    console.log('')
  } catch (error) {
    console.error('❌ Failed to parse database credentials:', error)
    return
  }

  // Test connectivity
  console.log('🔌 Testing Database Connectivity...')
  const result = await testDatabaseConnectivity()
  
  if (result.success) {
    console.log(`✅ Database connection successful via ${result.method.toUpperCase()}`)
    if (result.details) {
      console.log('📋 Connection Details:')
      Object.entries(result.details).forEach(([key, value]) => {
        console.log(`  ${key}: ${JSON.stringify(value)}`)
      })
    }
  } else {
    console.log(`❌ Database connection failed`)
    console.log(`   Method attempted: ${result.method}`)
    console.log(`   Error: ${result.error}`)
    if (result.details) {
      console.log('📋 Details:')
      Object.entries(result.details).forEach(([key, value]) => {
        console.log(`  ${key}: ${JSON.stringify(value)}`)
      })
    }
  }

  console.log('')
  
  // Environment check
  console.log('🌍 Environment Variables:')
  console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`)
  console.log(`  SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`)
  console.log(`  SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}`)

  console.log('\n📝 Recommendations:')
  if (!process.env.SUPABASE_ANON_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('  - Add SUPABASE_ANON_KEY to enable Supabase client connectivity')
    console.log('  - Get your keys from: https://supabase.com/dashboard/projects/giqivooxvzhqoyindsvs/settings/api')
  }
  
  if (!result.success) {
    console.log('  - Check if your Supabase project is active and accessible')
    console.log('  - Verify DATABASE_URL credentials are correct')
    console.log('  - Ensure your IP is allowed in Supabase network restrictions')
  }
}

// Run the test
runDatabaseTest().catch(console.error)