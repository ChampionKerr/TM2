import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding production database...')

  try {
    // Create admin user
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin123!'
    if (adminPassword.length < 8) {
      throw new Error('Admin password must be at least 8 characters long')
    }
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 12)
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@timewise.com' },
      update: {},
      create: {
        email: 'admin@timewise.com',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin',
        department: 'IT',
        password: hashedAdminPassword,
        passwordResetRequired: false,
        vacationDays: 25,
        sickDays: 15
      }
    })

    console.log('✅ Admin user created/updated:', adminUser.email)

    // Create HR manager
    const hrManagerPassword = 'HRManager123!'
    const hashedHRPassword = await bcrypt.hash(hrManagerPassword, 12)
    
    const hrManager = await prisma.user.upsert({
      where: { email: 'hr.manager@timewise.com' },
      update: {},
      create: {
        email: 'hr.manager@timewise.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'admin',
        department: 'Human Resources',
        password: hashedHRPassword,
        passwordResetRequired: false,
        vacationDays: 25,
        sickDays: 15
      }
    })

    console.log('✅ HR Manager created/updated:', hrManager.email)

    // Create sample employees if in development
    if (process.env.NODE_ENV !== 'production') {
      const employeePassword = 'Employee123!'
      const hashedEmployeePassword = await bcrypt.hash(employeePassword, 12)
      
      const employees = [
        {
          email: 'john.doe@timewise.com',
          firstName: 'John',
          lastName: 'Doe',
          department: 'Engineering'
        },
        {
          email: 'jane.smith@timewise.com',
          firstName: 'Jane',
          lastName: 'Smith',
          department: 'Marketing'
        },
        {
          email: 'mike.wilson@timewise.com',
          firstName: 'Mike',
          lastName: 'Wilson',
          department: 'Sales'
        }
      ]

      for (const emp of employees) {
        await prisma.user.upsert({
          where: { email: emp.email },
          update: {},
          create: {
            ...emp,
            role: 'user',
            password: hashedEmployeePassword,
            passwordResetRequired: false,
            vacationDays: 20,
            sickDays: 10
          }
        })
        console.log(`✅ Employee created/updated: ${emp.email}`)
      }

      // Create sample leave requests
      const employees_created = await prisma.user.findMany({
        where: { role: 'user' },
        take: 2
      })

      if (employees_created.length > 0) {
        const sampleRequests = [
          {
            userId: employees_created[0].id,
            type: 'Annual' as const,
            startDate: new Date('2024-12-23'),
            endDate: new Date('2024-12-27'),
            reason: 'Christmas holidays with family',
            status: 'Pending' as const,
            daysRequested: 5
          },
          {
            userId: employees_created[0].id,
            type: 'Sick' as const,
            startDate: new Date('2024-10-15'),
            endDate: new Date('2024-10-16'),
            reason: 'Medical appointment',
            status: 'Approved' as const,
            daysRequested: 2,
            reviewedAt: new Date('2024-10-10'),
            reviewedBy: adminUser.id
          }
        ]

        for (const request of sampleRequests) {
          try {
            await prisma.leaveRequest.create({
              data: {
                ...request,
                requestedAt: new Date()
              }
            })
            console.log(`✅ Sample leave request created`)
          } catch (error) {
            console.log(`⚠️  Skipped duplicate leave request`)
          }
        }
      }
    }

    console.log('\n🎉 Database seeding completed successfully!')
    
    console.log('\n👥 Default Users:')
    console.log(`Admin: admin@timewise.com / ${adminPassword}`)
    console.log(`HR Manager: hr.manager@timewise.com / HRManager123!`)
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Sample Employees: *@timewise.com / Employee123!')
    }
    
    console.log('\n⚠️  Remember to change default passwords in production!')

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })