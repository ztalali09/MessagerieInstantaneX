import { io } from 'socket.io-client';
import { ref, onMounted, onUnmounted } from 'vue';

export const useSocket = () => {
  const socket = ref(null);
  const connected = ref(false);
  const messages = ref([]);

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
      const userId = localStorage.getItem('userId'); // depuis ton auth
      socket.value.emit('register', userId);
    });

    // Écouter la réception de messages
    socket.value.on('receive_message', (data) => {
      console.log('📨 Message received:', data);
      messages.value.push(data);
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
    const from = localStorage.getItem('userId');
    const data = {
      from,
      to,
      message,
      timestamp: new Date().toISOString()
    };

    console.log('📤 Sending message:', data);
    socket.value.emit('send_message', data);
  };

  return {
    socket,
    connected,
    messages,
    sendMessage
  };
};
