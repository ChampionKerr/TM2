#!/usr/bin/env npx tsx
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

async function testUserLogins() {
  console.log('👥 Testing User Login Credentials...')
  console.log('===================================')
  
  try {
    // Get all users from database
    const users = await prisma.user.findMany({
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        password: true
      },
      orderBy: [
        { role: 'desc' }, // Admin users first
        { email: 'asc' }
      ]
    })
    
    console.log(`Found ${users.length} users in database\n`)
    
    // Test passwords for different user types
    const testCredentials = [
      { email: 'admin@timewise.com', password: 'Admin123!', expectedRole: 'admin' },
      { email: 'hr.manager@timewise.com', password: 'HRManager123!', expectedRole: 'admin' },
      { email: 'john.doe@timewise.com', password: 'Employee123!', expectedRole: 'user' },
      { email: 'jane.smith@timewise.com', password: 'Employee123!', expectedRole: 'user' },
      { email: 'mike.wilson@timewise.com', password: 'Employee123!', expectedRole: 'user' }
    ]
    
    for (const testCred of testCredentials) {
      const user = users.find(u => u.email === testCred.email)
      
      if (!user) {
        console.log(`❌ ${testCred.email} - User not found`)
        continue
      }
      
      const passwordMatch = await bcrypt.compare(testCred.password, user.password)
      const roleMatch = user.role === testCred.expectedRole
      
      const status = passwordMatch && roleMatch ? '✅' : '❌'
      const authStatus = passwordMatch ? 'PASS' : 'FAIL'
      const roleStatus = roleMatch ? user.role.toUpperCase() : `WRONG ROLE (${user.role})`
      
      console.log(`${status} ${user.email}`)
      console.log(`   👤 ${user.firstName} ${user.lastName} | 🏢 ${user.department}`)
      console.log(`   🔑 Password (${testCred.password}): ${authStatus}`)
      console.log(`   👑 Role: ${roleStatus}`)
      console.log('')
    }
    
    // Show all users in database for reference
    console.log('📋 All Users in Database:')
    console.log('========================')
    
    users.forEach((user, index) => {
      const roleIcon = user.role === 'admin' ? '👑' : '👤'
      console.log(`${index + 1}. ${roleIcon} ${user.email}`)
      console.log(`   Name: ${user.firstName} ${user.lastName}`)
      console.log(`   Role: ${user.role} | Department: ${user.department}`)
      console.log('')
    })
    
    // Summary
    const adminCount = users.filter(u => u.role === 'admin').length
    const userCount = users.filter(u => u.role === 'user').length
    
    console.log('📊 Summary:')
    console.log(`   👑 Admin users: ${adminCount}`)
    console.log(`   👤 Regular users: ${userCount}`)
    console.log(`   📧 Total users: ${users.length}`)
    console.log('')
    console.log('🌐 Login URL: https://timwiz.vercel.app/signin')
    
  } catch (error) {
    console.error('❌ Failed to test user logins:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testUserLogins()