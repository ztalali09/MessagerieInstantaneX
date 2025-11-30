import { ref, computed } from 'vue';

interface MessageNotification {
  id: number;
  fromUserId: string;
  fromUsername: string;
  message: string;
  messageType: string;
  timestamp: string;
}

const currentNotification = ref<MessageNotification | null>(null);
let notificationTimeout: ReturnType<typeof setTimeout> | null = null;
let idCounter = 0;

// Fonction pour générer un son style matrix
function playMatrixNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Fréquence style matrix (son électronique)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    
    // Type d'onde pour un son plus électronique
    oscillator.type = 'sine';
    
    // Enveloppe du son
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
}

export function useMessageNotifications() {
  const showNotification = (
    fromUserId: string,
    fromUsername: string,
    message: string,
    messageType: string = 'text',
    timestamp: string = new Date().toISOString()
  ) => {
    // Annuler la notification précédente si elle existe
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
      notificationTimeout = null;
    }
    
    // Créer ou mettre à jour la notification
    currentNotification.value = {
      id: idCounter++,
      fromUserId,
      fromUsername,
      message,
      messageType,
      timestamp
    };
    
    // Jouer le son de notification
    playMatrixNotificationSound();
    
    // Masquer après 3 secondes
    notificationTimeout = setTimeout(() => {
      currentNotification.value = null;
      notificationTimeout = null;
    }, 3000);
  };
  
  const hideNotification = () => {
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
      notificationTimeout = null;
    }
    currentNotification.value = null;
  };
  
  return {
    currentNotification: computed(() => currentNotification.value),
    showNotification,
    hideNotification
  };
}

