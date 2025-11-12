import { getDb } from './database';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const users = [
  { username: 'Alice', password: 'password123' },
  { username: 'Bob', password: 'password123' }
];

export async function seed() {
  console.log('Seeding database...');
  const prisma = getDb() as PrismaClient;

  try {
    const saltRounds = 10;

    for (const user of users) {
      const passwordHash = await bcrypt.hash(user.password, saltRounds);

      // Use upsert to create if not exists
      const result = await prisma.user.upsert({
        where: {
          username: user.username,
        },
        update: {},
        create: {
          username: user.username,
          password_hash: passwordHash,
        },
      });

      if (result.id) {
        console.log(`User ${user.username} ensured with ID: ${result.id}`);
      }
    }

    console.log('Database seeding check complete.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
