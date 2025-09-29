import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'admin'
      }
    });

    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123secure', 12);
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@timewise.com',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        department: 'IT',
        role: 'admin',
      }
    });

    console.log('✅ Admin user created successfully:', {
      id: adminUser.id,
      email: adminUser.email,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      role: adminUser.role
    });
  } catch (error) {
    console.error('Failed to create admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
