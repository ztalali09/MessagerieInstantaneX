// src/socket.ts

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { saveMessage, getRecentMessagesForUser } from './models/messages';

// Define a type for the messages for better type safety
interface IChatMessage {
  room: string;
  sender: string;
  message: string;
  timestamp: Date;
}

// Store connected users: userId -> socketId
const connectedUsers = new Map<string, string>();

// Get list of online user IDs
function getOnlineUsers(): string[] {
  return Array.from(connectedUsers.keys());
}

function getSocketIdByUserId(userId: string): string | undefined {
  return connectedUsers.get(userId.toString());
}

export const initializeSocketIO = (httpServer: HttpServer) => {
  // Create a new Socket.IO server instance
  const io = new SocketIOServer(httpServer, {
    // Configure CORS to allow your frontend to connect
    cors: {
      origin: '*', // IMPORTANT: In production, restrict this to your frontend's URL
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Listen for new client connections
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 New user connected: ${socket.id}`);

    // Handle user registration
    socket.on('register', async (userId: string) => {
      connectedUsers.set(userId, socket.id);
      console.log(`👤 User ${userId} registered with socket ${socket.id}`);

      // Broadcast online status to all users
      io.emit('user_online', userId);

      // Send message history to the user (recent messages involving this user)
      try {
        const messages = await getRecentMessagesForUser(parseInt(userId));
        if (messages.length > 0) {
          socket.emit('message_history', messages);
          console.log(`📚 Sent ${messages.length} messages to user ${userId}`);
        }
      } catch (error) {
        console.error('Error loading message history:', error);
      }

      // Send current online users list
      socket.emit('online_users', getOnlineUsers());
    });

    // --- Chat Room Logic ---

    /**
     * Listen for a 'join_room' event
     * @param {string} room - The ID of the chat room to join
     */
    socket.on('join_room', (room: string) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room: ${room}`);
      // You could optionally emit an event to the room here
      // socket.to(room).emit('user_joined', { userId: socket.id });
    });

    // --- Private Messaging Logic ---

    /**
     * Listen for a 'send_message' event
     * @param {IChatMessage} data - The message object
     */
    socket.on('send_message', async (data: IChatMessage) => {
      console.log(`📨 Message received from ${data.sender} in room ${data.room}: ${data.message}`);

      try {
        // Save message to database
        const messageId = await saveMessage(parseInt(data.sender), null, data.room, data.message);
        console.log(`💾 Room message saved to database with ID: ${messageId}`);

        // Create message object with database fields
        const messageData = {
          id: messageId,
          from_user_id: parseInt(data.sender),
          to_user_id: null,
          room: data.room,
          message: data.message,
          timestamp: new Date().toISOString(),
          from_username: '', // Will be populated by frontend or fetched later
          to_username: null
        };

        // Broadcast the received message to all clients in the same room
        io.to(data.room).emit('receive_message', messageData);
        console.log(`📤 Message broadcasted to room ${data.room}`);
      } catch (error) {
        console.error('Error saving room message:', error);
      }
    });

    /**
     * Listen for a 'private-message' event (alternative event name)
     */
    socket.on('private-message', async (data) => {
      console.log(`📨 Private message received:`, data);

      try {
        // Save message to database and get the ID
        const messageId = await saveMessage(parseInt(data.from), parseInt(data.to), null, data.message);
        console.log(`💾 Message saved to database with ID: ${messageId}`);

        // Fetch usernames from database
        const { getUserById } = await import('./models/users.js');
        const fromUser = await getUserById(parseInt(data.from));
        const toUser = await getUserById(parseInt(data.to));

        // Create message object with database fields
        const messageData = {
          id: messageId,
          from_user_id: parseInt(data.from),
          to_user_id: parseInt(data.to),
          room: null,
          message: data.message,
          timestamp: new Date().toISOString(),
          from_username: fromUser?.username || 'Unknown',
          to_username: toUser?.username || 'Unknown'
        };

        // For private messages, we need to send to specific user
        // Find the recipient's socket and emit to them
        const recipientSocketId = getSocketIdByUserId(data.to);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('receive_message', messageData);
          console.log(`📤 Private message sent to user ${data.to}`);
        } else {
          console.log(`❌ User ${data.to} not connected`);
        }

        // Also send back to sender for confirmation
        socket.emit('receive_message', messageData);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    /**
     * Listen for a 'leave_room' event
     * @param {string} room - The ID of the chat room to leave
     */
    socket.on('leave_room', (room: string) => {
      socket.leave(room);
      console.log(`User ${socket.id} left room: ${room}`);
    });

    // Handle typing indicators
    socket.on('start_typing', (data) => {
      console.log(`✍️ User ${data.from || 'unknown'} started typing to ${data.to}`);
      // Find the recipient's socket and emit to them
      const recipientSocketId = getSocketIdByUserId(data.to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user_typing', data.from || 'unknown');
      }
    });

    socket.on('stop_typing', (data) => {
      console.log(`🛑 User ${data.from || 'unknown'} stopped typing to ${data.to}`);
      // Find the recipient's socket and emit to them
      const recipientSocketId = getSocketIdByUserId(data.to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user_stop_typing', data.from || 'unknown');
      }
    });

    // --- Disconnect Logic ---

    // Listen for client disconnection
    socket.on('disconnect', () => {
      console.log(`👋 User disconnected: ${socket.id}`);
      // Remove user from connected users map
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          console.log(`🗑️ Removed user ${userId} from connected users`);
          // Broadcast offline status to all users
          io.emit('user_offline', userId);
          break;
        }
      }
    });
  });

  console.log('Socket.IO initialized');
  return io;
};
