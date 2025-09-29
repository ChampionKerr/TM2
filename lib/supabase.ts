import { createClient } from '@supabase/supabase-js'

// Extract Supabase project details from DATABASE_URL
const getDatabaseCredentials = () => {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  
  // Parse the PostgreSQL URL to extract host information
  // Format: postgresql://postgres:password@db.projectid.supabase.co:5432/postgres
  const url = new URL(databaseUrl)
  const host = url.hostname
  
  // Extract project ID from Supabase host format: db.{projectid}.supabase.co
  const projectIdMatch = host.match(/^db\.([^.]+)\.supabase\.co$/)
  if (!projectIdMatch) {
    throw new Error('Invalid Supabase database URL format')
  }
  
  const projectId = projectIdMatch[1]
  
  return {
    projectId,
    host,
    password: url.password
  }
}

// Supabase configuration
const getSupabaseConfig = () => {
  const { projectId } = getDatabaseCredentials()
  
  // Supabase URL format: https://{project-id}.supabase.co
  const supabaseUrl = `https://${projectId}.supabase.co`
  
  // For production, you would need the anon key from Supabase dashboard
  // For now, we'll use a placeholder or environment variable
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseKey) {
    console.warn('SUPABASE_ANON_KEY not found. Using database connection only.')
    return null
  }
  
  return { supabaseUrl, supabaseKey }
}

// Create Supabase client (lazy initialization to avoid import-time errors)
let supabase: ReturnType<typeof createClient> | null = null
let supabaseInitialized = false

function getSupabaseClient() {
  if (supabaseInitialized) {
    return supabase
  }
  
  try {
    const config = getSupabaseConfig()
    if (config) {
      supabase = createClient(config.supabaseUrl, config.supabaseKey)
    }
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error)
    supabase = null
  }
  
  supabaseInitialized = true
  return supabase
}

// Test database connectivity using Supabase client
export async function testSupabaseConnection(): Promise<{
  success: boolean
  error?: string
  method: 'supabase' | 'unavailable'
}> {
  const supabaseClient = getSupabaseClient()
  
  if (!supabaseClient) {
    return {
      success: false,
      error: 'Supabase client not available - missing SUPABASE_ANON_KEY',
      method: 'unavailable'
    }
  }
  
  try {
    // Simple connectivity test using Supabase client
    const { data: _data, error } = await supabaseClient.from('user').select('count', { count: 'exact', head: true })
    
    if (error) {
      return {
        success: false,
        error: error.message,
        method: 'supabase'
      }
    }
    
    return {
      success: true,
      method: 'supabase'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Supabase error',
      method: 'supabase'
    }
  }
}

// Enhanced health check that tries both Supabase client and direct Prisma
export async function testDatabaseConnectivity(): Promise<{
  success: boolean
  method: 'prisma' | 'supabase' | 'none'
  error?: string
  details?: Record<string, unknown>
}> {
  // Try Supabase client first if available
  const supabaseClient = getSupabaseClient()
  
  if (supabaseClient) {
    const supabaseTest = await testSupabaseConnection()
    if (supabaseTest.success) {
      return {
        success: true,
        method: 'supabase',
        details: { client: 'supabase-js' }
      }
    }
  }
  
  // Fallback to Prisma
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    })
    
    await prisma.$connect()
    
    // Test basic query
    const userCount = await prisma.user.count()
    await prisma.$disconnect()
    
    return {
      success: true,
      method: 'prisma',
      details: { userCount, client: 'prisma' }
    }
  } catch (error) {
    return {
      success: false,
      method: 'none',
      error: error instanceof Error ? error.message : 'Database connection failed',
      details: { attempted: ['supabase', 'prisma'] }
    }
  }
}

// Export the Supabase client getter for use in other parts of the application
export { getSupabaseClient as supabase }

// Export database credentials for debugging
export { getDatabaseCredentials }