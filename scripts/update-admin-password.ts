#!/usr/bin/env npx tsx
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

async function updateAdminPassword() {
  console.log('🔄 Updating Admin Password...')
  console.log('=============================')
  
  try {
    const newPassword = 'Admin123!'
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    const updatedUser = await prisma.user.update({
      where: { email: 'admin@timewise.com' },
      data: { password: hashedPassword },
      select: { email: true, firstName: true, lastName: true, role: true }
    })
    
    console.log('✅ Admin password updated successfully!')
    console.log('   📧 Email:', updatedUser.email)
    console.log('   👤 Name:', `${updatedUser.firstName} ${updatedUser.lastName}`)
    console.log('   🔑 New Password:', newPassword)
    console.log('')
    
    // Test the new password
    const user = await prisma.user.findUnique({
      where: { email: 'admin@timewise.com' }
    })
    
    if (user) {
      const passwordMatch = await bcrypt.compare(newPassword, user.password)
      console.log('🔍 Password verification:', passwordMatch ? '✅ SUCCESS' : '❌ FAILED')
      
      if (passwordMatch) {
        console.log('')
        console.log('🎉 ADMIN LOGIN READY!')
        console.log('   Go to: https://timwiz.vercel.app/signin')
        console.log('   Email: admin@timewise.com')
        console.log('   Password: Admin123!')
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to update admin password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateAdminPassword()