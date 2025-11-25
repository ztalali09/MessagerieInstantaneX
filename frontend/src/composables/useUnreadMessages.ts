import { ref, computed } from 'vue';

interface UnreadCount {
  [userId: string]: number;
}

const unreadMessages = ref<UnreadCount>({});
const lastReadTimestamps = ref<{ [userId: string]: number }>({});

export function useUnreadMessages() {
  const increment = (userId: string) => {
    if (!unreadMessages.value[userId]) {
      unreadMessages.value[userId] = 0;
    }
    unreadMessages.value[userId]++;
  };

  const markAsRead = (userId: string) => {
    unreadMessages.value[userId] = 0;
    lastReadTimestamps.value[userId] = Date.now();
  };

  const getCount = (userId: string): number => {
    return unreadMessages.value[userId] || 0;
  };

  const totalUnread = computed(() => {
    return Object.values(unreadMessages.value).reduce((sum, count) => sum + count, 0);
  });

  return {
    unreadMessages,
    increment,
    markAsRead,
    getCount,
    totalUnread
  };
}


