import { getDb } from '../database';
import { PrismaClient } from '@prisma/client';

interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserResponse {
  id: number;
  username: string;
  created_at: Date;
}

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

export const createUser = async (username: string, passwordHash: string, publicKey: string, encryptedPrivateKey: string): Promise<number> => {
  const prisma = getDb() as PrismaClient;
  const user = await prisma.user.create({
    data: {
      username,
      password_hash: passwordHash,
      publicKey,
      encryptedPrivateKey,
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
