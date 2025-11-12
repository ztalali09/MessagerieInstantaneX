import { getDb } from '../database';
import { PrismaClient } from '@prisma/client';

export interface Message {
  id: number;
  from_user_id: number;
  to_user_id?: number;
  room?: string;
  message: string;
  timestamp: Date;
}

export interface MessageResponse {
  id: number;
  from_user_id: number;
  to_user_id: number;
  room?: string;
  message: string;
  timestamp: Date;
  from_username?: string;
  to_username?: string;
}

export const saveMessage = async (fromUserId: number, toUserId: number | null, room: string | null, message: string): Promise<number> => {
  const prisma = getDb() as PrismaClient;
  const savedMessage = await prisma.message.create({
    data: {
      from_user_id: fromUserId,
      to_user_id: toUserId,
      room: room,
      message: message,
    },
  });
  return savedMessage.id;
};

export const getMessagesBetweenUsers = async (userId1: number, userId2: number): Promise<MessageResponse[]> => {
  const prisma = getDb() as PrismaClient;
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        {
          from_user_id: userId1,
          to_user_id: userId2,
        },
        {
          from_user_id: userId2,
          to_user_id: userId1,
        },
      ],
    },
    include: {
      fromUser: {
        select: {
          username: true,
        },
      },
      toUser: {
        select: {
          username: true,
        },
      },
    },
    orderBy: {
      timestamp: 'asc',
    },
  });

  return messages.map((msg: any) => ({
    id: msg.id,
    from_user_id: msg.from_user_id,
    to_user_id: msg.to_user_id || 0,
    room: msg.room || undefined,
    message: msg.message,
    timestamp: msg.timestamp,
    from_username: msg.fromUser?.username,
    to_username: msg.toUser?.username,
  }));
};

export const getRecentMessagesForUser = async (userId: number, limit: number = 50, conversationUserId?: number, room?: string): Promise<MessageResponse[]> => {
  const prisma = getDb() as PrismaClient;

  let whereCondition: any = {
    OR: [
      { from_user_id: userId },
      { to_user_id: userId },
    ],
  };

  if (conversationUserId) {
    whereCondition = {
      OR: [
        {
          from_user_id: userId,
          to_user_id: conversationUserId,
        },
        {
          from_user_id: conversationUserId,
          to_user_id: userId,
        },
      ],
    };
  } else if (room) {
    whereCondition.room = room;
  }

  const messages = await prisma.message.findMany({
    where: whereCondition,
    include: {
      fromUser: {
        select: {
          username: true,
        },
      },
      toUser: {
        select: {
          username: true,
        },
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
    take: limit,
  });

  // Reverse to get chronological order
  const reversedMessages = messages.reverse();

  return reversedMessages.map((msg: any) => ({
    id: msg.id,
    from_user_id: msg.from_user_id,
    to_user_id: msg.to_user_id || 0,
    room: msg.room || undefined,
    message: msg.message,
    timestamp: msg.timestamp,
    from_username: msg.fromUser?.username,
    to_username: msg.toUser?.username,
  }));
};
