import { getDb } from '../database';
import { PrismaClient, User } from '@prisma/client';

export type UserResponse = Pick<User, 'id' | 'username' | 'created_at'>;

export const getAllUsers = async (): Promise<UserResponse[]> => {
  const prisma = getDb() as PrismaClient;
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      created_at: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });
  return users;
};

export const createUser = async (username: string, passwordHash: string, rsaPrivateKey: string, rsaPublicKey: string): Promise<number> => {
  const prisma = getDb() as PrismaClient;
  const user = await prisma.user.create({
    data: {
      username,
      password_hash: passwordHash,
      rsa_private_key: rsaPrivateKey,
      rsa_public_key: rsaPublicKey,
    },
  });
  return user.id;
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
  const prisma = getDb() as PrismaClient;
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  return user;
};

export const getUserById = async (id: number): Promise<User | null> => {
  const prisma = getDb() as PrismaClient;
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  return user;
};
