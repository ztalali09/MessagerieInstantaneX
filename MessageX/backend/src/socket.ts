// src/socket.ts

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

// Define a type for the messages for better type safety
interface IChatMessage {
  room: string;
  sender: string;
  message: string;
  timestamp: Date;
}

// Store connected users: userId -> socketId
const connectedUsers = new Map<string, string>();

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
    },
  });

  // Listen for new client connections
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 New user connected: ${socket.id}`);

    // Handle user registration
    socket.on('register', (userId: string) => {
      connectedUsers.set(userId, socket.id);
      console.log(`👤 User ${userId} registered with socket ${socket.id}`);
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

    /**
     * Listen for a 'send_message' event
     * @param {IChatMessage} data - The message object
     */
    socket.on('send_message', (data: IChatMessage) => {
      console.log(`📨 Message received from ${data.sender} in room ${data.room}: ${data.message}`);
      // Broadcast the received message to all other clients in the same room
      // Using `io.to(room)` emits to everyone in the room, including the sender
      io.to(data.room).emit('receive_message', data);
      console.log(`📤 Message broadcasted to room ${data.room}`);
    });

    /**
     * Listen for a 'private-message' event (alternative event name)
     */
    socket.on('private-message', (data) => {
      console.log(`📨 Private message received:`, data);
      // For private messages, we need to send to specific user
      // Find the recipient's socket and emit to them
      const recipientSocketId = getSocketIdByUserId(data.to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('receive_message', data);
        console.log(`📤 Private message sent to user ${data.to}`);
      } else {
        console.log(`❌ User ${data.to} not connected`);
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

    // --- Disconnect Logic ---

    // Listen for client disconnection
    socket.on('disconnect', () => {
      console.log(`👋 User disconnected: ${socket.id}`);
      // Remove user from connected users map
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          console.log(`🗑️ Removed user ${userId} from connected users`);
          break;
        }
      }
    });
  });

  console.log('Socket.IO initialized');
  return io;
};
