#!/usr/bin/env npx tsx
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

async function testAuth() {
  console.log('🔐 Testing Admin Authentication...')
  console.log('================================')
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@timewise.com' }
    })
    
    if (!user) {
      console.log('❌ Admin user not found')
      return
    }
    
    console.log('✅ Admin user found:')
    console.log('   📧 Email:', user.email)
    console.log('   👤 Name:', `${user.firstName} ${user.lastName}`)
    console.log('   🏢 Department:', user.department)
    console.log('   👑 Role:', user.role)
    console.log('')
    
    // Test password
    const testPassword = 'Admin123!'
    const passwordMatch = await bcrypt.compare(testPassword, user.password)
    
    console.log('🔑 Password Test:')
    console.log('   Testing password:', testPassword)
    console.log('   Result:', passwordMatch ? '✅ MATCH' : '❌ NO MATCH')
    console.log('')
    
    if (passwordMatch) {
      console.log('🎉 AUTHENTICATION TEST SUCCESSFUL!')
      console.log('   Login credentials are working correctly')
      console.log('   You can now log in at: https://timwiz.vercel.app/signin')
    } else {
      console.log('⚠️  AUTHENTICATION FAILED')
      console.log('   Password does not match stored hash')
    }
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAuth()