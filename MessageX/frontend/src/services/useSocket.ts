import { io } from 'socket.io-client';
import { ref, onMounted, onUnmounted } from 'vue';

export const useSocket = () => {
  const socket = ref(null);
  const connected = ref(false);
  const messages = ref([]);
  const onlineUsers = ref([]);
  const typingUsers = ref([]);

  onMounted(() => {
    // Connexion au serveur Socket.IO
    socket.value = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    // Écouter la connexion
    socket.value.on('connect', () => {
      connected.value = true;
      console.log('Connecté au serveur Socket.IO');

      // Enregistrer l'utilisateur dans sa room
      const userId = sessionStorage.getItem('userId'); // depuis ton auth
      socket.value.emit('register', userId);
    });

    // Écouter la réception de messages
    socket.value.on('receive_message', (data) => {
      console.log('📨 Message received:', data);
      messages.value.push(data);
    });

    // Écouter l'historique des messages
    socket.value.on('message_history', (history) => {
      console.log('📚 Message history received:', history);
      messages.value.push(...history);
    });

    // Écouter les utilisateurs en ligne
    socket.value.on('online_users', (users) => {
      console.log('👥 Online users:', users);
      onlineUsers.value = users;
    });

    // Écouter quand un utilisateur se connecte
    socket.value.on('user_online', (userId) => {
      console.log('🟢 User online:', userId);
      if (!onlineUsers.value.includes(userId)) {
        onlineUsers.value.push(userId);
      }
    });

    // Écouter quand un utilisateur se déconnecte
    socket.value.on('user_offline', (userId) => {
      console.log('⚫ User offline:', userId);
      onlineUsers.value = onlineUsers.value.filter(id => id !== userId);
      typingUsers.value = typingUsers.value.filter(id => id !== userId);
    });

    // Écouter les indicateurs de frappe
    socket.value.on('user_typing', (userId) => {
      console.log('✍️ User typing:', userId);
      if (!typingUsers.value.includes(userId)) {
        typingUsers.value.push(userId);
      }
    });

    socket.value.on('user_stop_typing', (userId) => {
      console.log('🛑 User stop typing:', userId);
      typingUsers.value = typingUsers.value.filter(id => id !== userId);
    });

    // Gérer la déconnexion
    socket.value.on('disconnect', () => {
      connected.value = false;
      console.log('Déconnecté du serveur');
    });
  });

  onUnmounted(() => {
    if (socket.value) {
      socket.value.disconnect();
    }
  });

  const sendMessage = (to, message) => {
    const from = sessionStorage.getItem('userId');
    const data = {
      from,
      to,
      message,
      timestamp: new Date().toISOString()
    };

    console.log('📤 Sending message:', data);
    socket.value.emit('private-message', data);
  };

  const startTyping = (toUserId) => {
    const from = sessionStorage.getItem('userId');
    socket.value.emit('start_typing', { from, to: toUserId });
  };

  const stopTyping = (toUserId) => {
    const from = sessionStorage.getItem('userId');
    socket.value.emit('stop_typing', { from, to: toUserId });
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
