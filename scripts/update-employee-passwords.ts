#!/usr/bin/env npx tsx
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

async function updateEmployeePasswords() {
  console.log('🔄 Updating Employee Passwords...')
  console.log('=================================')
  
  try {
    const standardPassword = 'Employee123!'
    const hashedPassword = await bcrypt.hash(standardPassword, 12)
    
    // Get all regular users (non-admin)
    const employees = await prisma.user.findMany({
      where: { role: 'user' },
      select: { email: true, firstName: true, lastName: true }
    })
    
    console.log(`Found ${employees.length} employee accounts\n`)
    
    // Update passwords for all employees
    for (const employee of employees) {
      await prisma.user.update({
        where: { email: employee.email },
        data: { password: hashedPassword }
      })
      
      console.log(`✅ Updated password for ${employee.email} (${employee.firstName} ${employee.lastName})`)
    }
    
    console.log(`\n🎉 All employee passwords updated to: ${standardPassword}`)
    console.log('\n📋 Updated Employee Login Credentials:')
    console.log('=====================================')
    
    employees.forEach(emp => {
      console.log(`📧 ${emp.email}`)
      console.log(`👤 ${emp.firstName} ${emp.lastName}`)
      console.log(`🔑 Password: ${standardPassword}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Failed to update employee passwords:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateEmployeePasswords()