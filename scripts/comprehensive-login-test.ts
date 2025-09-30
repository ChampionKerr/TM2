#!/usr/bin/env npx tsx
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

async function comprehensiveLoginTest() {
  console.log('🔍 Comprehensive User Login Test')
  console.log('=================================')
  
  try {
    // Get all users
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
        { role: 'desc' },
        { email: 'asc' }
      ]
    })
    
    // Test all users with their expected passwords
    let passCount = 0
    let failCount = 0
    
    console.log('Testing all user accounts:\n')
    
    for (const user of users) {
      const testPassword = user.role === 'admin' 
        ? (user.email.includes('hr.manager') ? 'HRManager123!' : 'Admin123!')
        : 'Employee123!'
      
      const passwordMatch = await bcrypt.compare(testPassword, user.password)
      const status = passwordMatch ? '✅ PASS' : '❌ FAIL'
      const roleIcon = user.role === 'admin' ? '👑' : '👤'
      
      if (passwordMatch) passCount++
      else failCount++
      
      console.log(`${status} ${roleIcon} ${user.email}`)
      console.log(`   👤 ${user.firstName} ${user.lastName}`)
      console.log(`   🏢 ${user.department} | 👑 ${user.role.toUpperCase()}`)
      console.log(`   🔑 Password: ${testPassword}`)
      console.log('')
    }
    
    // Summary
    console.log('📊 Test Results Summary:')
    console.log('========================')
    console.log(`✅ Successful logins: ${passCount}`)
    console.log(`❌ Failed logins: ${failCount}`)
    console.log(`📧 Total accounts tested: ${users.length}`)
    console.log(`🎯 Success rate: ${Math.round((passCount / users.length) * 100)}%`)
    console.log('')
    
    if (failCount === 0) {
      console.log('🎉 ALL USER LOGINS WORKING!')
      console.log('   Your Timewise HRMS app is ready for use')
    } else {
      console.log('⚠️  Some accounts need attention')
    }
    
    console.log('')
    console.log('🌐 Ready to test at: https://timwiz.vercel.app/signin')
    
    // Create credential summary
    console.log('')
    console.log('📋 LOGIN CREDENTIALS SUMMARY:')
    console.log('=============================')
    
    console.log('\n👑 ADMIN ACCOUNTS:')
    const admins = users.filter(u => u.role === 'admin')
    admins.forEach(admin => {
      const password = admin.email.includes('hr.manager') ? 'HRManager123!' : 'Admin123!'
      console.log(`   📧 ${admin.email}`)
      console.log(`   🔑 ${password}`)
      console.log(`   👤 ${admin.firstName} ${admin.lastName} (${admin.department})`)
      console.log('')
    })
    
    console.log('👤 EMPLOYEE ACCOUNTS:')
    const employees = users.filter(u => u.role === 'user')
    employees.forEach(emp => {
      console.log(`   📧 ${emp.email}`)
      console.log(`   🔑 Employee123!`)
      console.log(`   👤 ${emp.firstName} ${emp.lastName} (${emp.department})`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Comprehensive test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

comprehensiveLoginTest()