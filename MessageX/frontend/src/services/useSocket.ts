import { io, Socket } from 'socket.io-client';
import { ref, onMounted, onUnmounted } from 'vue';

interface Message {
  from: string;
  to: string;
  message: string;
  timestamp: string;
}

interface UseSocket {
  socket: ReturnType<typeof ref<Socket | null>>;
  connected: ReturnType<typeof ref<boolean>>;
  messages: ReturnType<typeof ref<Message[]>>;
  onlineUsers: ReturnType<typeof ref<string[]>>;
  typingUsers: ReturnType<typeof ref<string[]>>;
  sendMessage: (to: string, message: string) => void;
  startTyping: (toUserId: string) => void;
  stopTyping: (toUserId: string) => void;
}

export const useSocket = (): UseSocket => {
  const socket = ref<Socket | null>(null) as ReturnType<typeof ref<Socket | null>>;
  const connected = ref(false);
  const messages = ref<Message[]>([]);
  const onlineUsers = ref<string[]>([]);
  const typingUsers = ref<string[]>([]);

  onMounted(() => {
    // Connexion au serveur Socket.IO
    socket.value = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    // Écouter la connexion
    socket.value?.on('connect', () => {
      connected.value = true;
      console.log('Connecté au serveur Socket.IO');

      // Enregistrer l'utilisateur dans sa room
      const userId = sessionStorage.getItem('userId'); // depuis ton auth
      if (userId) {
        socket.value?.emit('register', userId);
      }
    });

    // Écouter la réception de messages
    socket.value?.on('receive_message', (data: Message) => {
      console.log('📨 Message received:', data);
      messages.value.push(data);
    });

    // Écouter l'historique des messages
    socket.value?.on('message_history', (history: Message[]) => {
      console.log('📚 Message history received:', history);
      messages.value.push(...history);
    });

    // Écouter les utilisateurs en ligne
    socket.value?.on('online_users', (users: string[]) => {
      console.log('👥 Online users:', users);
      onlineUsers.value = users;
    });

    // Écouter quand un utilisateur se connecte
    socket.value?.on('user_online', (userId: string) => {
      console.log('🟢 User online:', userId);
      if (!onlineUsers.value.includes(userId)) {
        onlineUsers.value.push(userId);
      }
    });

    // Écouter quand un utilisateur se déconnecte
    socket.value?.on('user_offline', (userId: string) => {
      console.log('⚫ User offline:', userId);
      onlineUsers.value = onlineUsers.value.filter(id => id !== userId);
      typingUsers.value = typingUsers.value.filter(id => id !== userId);
    });

    // Écouter les indicateurs de frappe
    socket.value?.on('user_typing', (userId: string) => {
      console.log('✍️ User typing:', userId);
      if (!typingUsers.value.includes(userId)) {
        typingUsers.value.push(userId);
      }
    });

    socket.value?.on('user_stop_typing', (userId: string) => {
      console.log('🛑 User stop typing:', userId);
      typingUsers.value = typingUsers.value.filter(id => id !== userId);
    });

    // Gérer la déconnexion
    socket.value?.on('disconnect', () => {
      connected.value = false;
      console.log('Déconnecté du serveur');
    });
  });

  onUnmounted(() => {
    if (socket.value) {
      socket.value.disconnect();
    }
  });

  const sendMessage = (to: string, message: string) => {
    const from = sessionStorage.getItem('userId');
    if (!from) return;

    const data: Message = {
      from,
      to,
      message,
      timestamp: new Date().toISOString()
    };

    console.log('📤 Sending message:', data);
    socket.value?.emit('private-message', data);
  };

  const startTyping = (toUserId: string) => {
    const from = sessionStorage.getItem('userId');
    if (!from) return;

    socket.value?.emit('start_typing', { from, to: toUserId });
  };

  const stopTyping = (toUserId: string) => {
    const from = sessionStorage.getItem('userId');
    if (!from) return;

    socket.value?.emit('stop_typing', { from, to: toUserId });
  };

  return {
    socket,
    connected,
    messages,
    onlineUsers,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping
  };
};
