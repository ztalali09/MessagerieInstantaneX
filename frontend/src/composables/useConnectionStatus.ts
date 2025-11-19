import { ref, onMounted, onUnmounted } from 'vue';

const isOnline = ref(navigator.onLine);
const isReconnecting = ref(false);

export function useConnectionStatus() {
  const handleOnline = () => {
    isOnline.value = true;
    isReconnecting.value = false;
  };

  const handleOffline = () => {
    isOnline.value = false;
    isReconnecting.value = true;
  };

  onMounted(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  });

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  });

  return {
    isOnline,
    isReconnecting
  };
}


