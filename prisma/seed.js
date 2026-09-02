const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('SecurePass123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@timewise.com' },
    update: {},
    create: {
      email: 'admin@timewise.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      department: 'HR',
      vacationDays: 20,
      sickDays: 10,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create employee user
  const employee = await prisma.user.upsert({
    where: { email: 'employee@timewise.com' },
    update: {},
    create: {
      email: 'employee@timewise.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      department: 'Engineering',
      vacationDays: 15,
      sickDays: 8,
    },
  });

  console.log('✅ Employee user created:', employee.email);

  // Create manager user
  const manager = await prisma.user.upsert({
    where: { email: 'manager@timewise.com' },
    update: {},
    create: {
      email: 'manager@timewise.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'manager',
      department: 'Engineering',
      vacationDays: 20,
      sickDays: 10,
    },
  });

  console.log('✅ Manager user created:', manager.email);

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
