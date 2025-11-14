import { io } from 'socket.io-client';
import { ref, onMounted, onUnmounted } from 'vue';
import { decryptMessage } from '../crypto/aes';
import { decryptWithPrivateKey } from '../crypto/rsa';

export const useSocket = () => {
  const socket = ref(null);
  const connected = ref(false);
  const messages = ref([]);
  const onlineUsers = ref([]);
  const typingUsers = ref([]);

  // Helper function to decrypt message content
  const decryptMessageContent = (encryptedMessage: string, encryptedKey: string): string => {
    try {
      const privateKey = sessionStorage.getItem('privateKey');
      if (!privateKey) {
        console.error('No private key found in session storage');
        return '[No private key]';
      }

      // First, decrypt the AES key using the private key
      const aesKeyBase64 = decryptWithPrivateKey(encryptedKey, privateKey);
      const aesKey = Buffer.from(aesKeyBase64, 'base64');

      // Then, decrypt the message using the AES key
      return decryptMessage(encryptedMessage, aesKey);
    } catch (error) {
      console.error('Failed to decrypt message:', error);
      return '[Decryption failed]';
    }
  };

  onMounted(() => {
    // Connexion au serveur Socket.IO
    socket.value = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
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

      // Decrypt the message if it's encrypted
      if (data.messageType === 'text' && data.encryptedKey) {
        data.decryptedMessage = decryptMessageContent(data.message, data.encryptedKey);
      }

      messages.value.push(data);
    });

    // Écouter l'historique des messages
    socket.value.on('message_history', (history) => {
      console.log('📚 Message history received:', history);

      // Decrypt messages in history
      const decryptedHistory = history.map((msg: any) => {
        if (msg.messageType === 'text' && msg.encryptedKey) {
          return {
            ...msg,
            decryptedMessage: decryptMessageContent(msg.message, msg.encryptedKey)
          };
        }
        return msg;
      });

      messages.value.push(...decryptedHistory);
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
