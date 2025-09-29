import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    // Drop all existing data
    console.log('Dropping existing data...');
    await prisma.$executeRaw`DROP TABLE IF EXISTS "LeaveRequest" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Session" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Account" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "VerificationToken" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Employee" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "User" CASCADE`;
    
    // Drop enums
    await prisma.$executeRaw`DROP TYPE IF EXISTS "Role" CASCADE`;
    await prisma.$executeRaw`DROP TYPE IF EXISTS "LeaveType" CASCADE`;
    await prisma.$executeRaw`DROP TYPE IF EXISTS "LeaveStatus" CASCADE`;
    
    console.log('✅ Database reset successful');
  } catch (error) {
    console.error('Failed to reset database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
