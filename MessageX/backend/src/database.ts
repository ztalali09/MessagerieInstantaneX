import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export async function initializeDatabase(): Promise<PrismaClient> {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL database with Prisma');
    return prisma;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

export function getDb(): PrismaClient {
  return prisma;
}

export async function closeDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error closing database:', error);
    throw error;
  }
}

// Graceful shutdown helper
export async function shutdownDatabase(): Promise<void> {
  try {
    await closeDatabase();
  } catch (error) {
    console.error('Error during database shutdown:', error);
    process.exit(1);
  }
}
