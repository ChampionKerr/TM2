import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Try to query users to test the connection
    const userCount = await prisma.user.count();
    console.log('✅ Successfully connected to the database');
    console.log(`Found ${userCount} users in the database`);

    // Test if we can get all users
    const users = await prisma.user.findMany();
    
    console.log('✅ All users:', users);

  } catch (error) {
    console.error('❌ Failed to connect to the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
