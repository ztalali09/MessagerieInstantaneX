<template>
  <div class="flex h-[calc(100vh-3.5rem)] flex-col md:flex-row overflow-hidden bg-zinc-950">
    <!-- Sidebar / Topbar -->
    <div class="flex w-full flex-row border-b border-white/5 bg-zinc-900/30 backdrop-blur-xl md:w-80 md:flex-col md:border-r md:border-b-0">
      <div class="hidden p-4 md:block">
        <h2 class="px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Direct Messages</h2>
      </div>
      
      <div class="flex flex-1 overflow-x-auto px-2 py-2 md:flex-col md:overflow-y-auto md:px-2 md:py-0">
        <div v-if="loading" class="flex justify-center py-4">
          <div class="h-5 w-5 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent"></div>
        </div>
        
        <div
          v-for="user in users"
          :key="user.id"
          @click="selectUser(user)"
          class="group flex min-w-[80px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 transition-all hover:bg-white/5 md:min-w-0 md:flex-row md:justify-start md:gap-3 md:px-3"
          :class="{ 'bg-white/10': selectedUser && selectedUser.id === user.id }"
        >
          <div class="relative">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 md:h-9 md:w-9">
              {{ user.username.charAt(0).toUpperCase() }}
            </div>
            <span
              v-if="onlineUsers.includes(user.id.toString())"
              class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-900 bg-emerald-500 md:h-2.5 md:w-2.5"
            ></span>
          </div>
          
          <div class="flex w-full flex-col items-center overflow-hidden md:items-start">
            <h4 class="w-full truncate text-center text-xs font-medium text-zinc-200 group-hover:text-white md:text-left md:text-sm">
              {{ user.username }}
            </h4>
            <p class="hidden truncate text-xs text-zinc-500 group-hover:text-zinc-400 md:block">
              {{ onlineUsers.includes(user.id.toString()) ? 'Online' : 'Offline' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Area -->
    <div class="flex flex-1 flex-col bg-zinc-950 min-h-0">
      <div v-if="selectedUser" class="flex items-center border-b border-white/5 bg-zinc-900/30 px-4 py-2 backdrop-blur-xl md:px-6 md:py-3">
        <div class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-medium text-white">
            {{ selectedUser.username.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h2 class="text-sm font-medium text-white">{{ selectedUser.username }}</h2>
            <p class="text-xs text-zinc-500">
              {{ onlineUsers.includes(selectedUser.id.toString()) ? 'Active now' : 'Offline' }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 md:p-6 messages-container min-h-0">
        <div v-if="!selectedUser" class="flex h-full flex-col items-center justify-center text-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">👋</div>
          <h3 class="mt-4 text-lg font-medium text-white">Welcome to MessageX</h3>
          <p class="mt-2 text-sm text-zinc-500">Select a conversation to start chatting</p>
        </div>

        <div v-else class="space-y-4 md:space-y-6">
          <div
            v-for="msg in conversationMessages"
            :key="msg.id || (msg.timestamp + msg.message)"
            class="flex flex-col"
            :class="msg.from_user_id == currentUserId ? 'items-end' : 'items-start'"
          >
            <div
              class="max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm"
              :class="msg.from_user_id == currentUserId 
                ? 'bg-indigo-600 text-white rounded-br-sm' 
                : 'bg-zinc-800 text-zinc-200 rounded-bl-sm'"
            >
              {{ msg.message }}
            </div>
            <span class="mt-1 text-[10px] text-zinc-600">
              {{ formatTimestamp(msg.timestamp) }}
            </span>
          </div>

          <!-- Typing indicator -->
          <div v-if="isUserTyping" class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-400">
              {{ selectedUser.username.charAt(0).toUpperCase() }}
            </div>
            <div class="flex items-center gap-1 rounded-full bg-zinc-800 px-3 py-2">
              <div class="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s]"></div>
              <div class="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]"></div>
              <div class="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedUser" class="border-t border-white/5 bg-zinc-900/30 p-3 md:p-4 backdrop-blur-xl">
        <form @submit.prevent="handleSendMessage" class="relative flex items-center gap-2">
          <input
            v-model="messageText"
            type="text"
            placeholder="Type a message..."
            autocomplete="off"
            @input="handleInput"
            class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 pr-12 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <button
            type="submit"
            class="absolute right-2 rounded-md p-1.5 text-zinc-400 hover:bg-white/10 hover:text-indigo-400 transition-colors"
            :disabled="!messageText.trim()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { apiService, type User } from '../services/api';
import { useSocket } from '../services/useSocket';
import { useUserStore } from '../stores/userStore';

const userStore = useUserStore();
const users = ref<User[]>([]);
const loading = ref(false);
const selectedUser = ref<User | null>(null);
const messageText = ref('');
const currentUserId = userStore.currentUser?.id.toString() || '';
const typingTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

const { messages, onlineUsers, typingUsers, sendMessage, startTyping, stopTyping } = useSocket();

const conversationMessages = computed(() => {
  if (!selectedUser.value) return [];
  const filtered = messages.value.filter(
    m =>
      (m.from_user_id == currentUserId && m.to_user_id == selectedUser.value?.id) ||
      (m.to_user_id == currentUserId && m.from_user_id == selectedUser.value?.id)
  );
  return filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
});

const isUserTyping = computed(() => {
  return selectedUser.value && typingUsers.value.includes(selectedUser.value.id.toString());
});

// Auto-scroll to bottom when new messages arrive
watch(conversationMessages, async () => {
  await nextTick();
  const messagesContainer = document.querySelector('.messages-container');
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}, { deep: true });

const loadUsers = async () => {
  loading.value = true;
  try {
    users.value = await apiService.getUsers();
    // Filter out the current user to prevent self-messaging
    users.value = users.value.filter(user => user.id !== userStore.currentUser?.id);
    if (users.value.length > 0) {
      selectedUser.value = users.value[0];
    }
  } catch (error) {
    console.error('Failed to load users:', error);
  } finally {
    loading.value = false;
  }
};

function selectUser(user: User) {
  selectedUser.value = user;
}

function handleSendMessage() {
  if (!messageText.value.trim() || !selectedUser.value) return;
  console.log('💬 Sending message to user:', selectedUser.value.username, 'Message:', messageText.value);
  sendMessage(selectedUser.value.id.toString(), messageText.value);
  messageText.value = '';

  // Stop typing indicator
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
    typingTimeout.value = null;
  }
  stopTyping(selectedUser.value.id.toString());
}

function handleInput() {
  if (!selectedUser.value) return;

  // Start typing indicator
  startTyping(selectedUser.value.id.toString());

  // Clear existing timeout
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }

  // Set timeout to stop typing indicator after 1 second of no input
  typingTimeout.value = setTimeout(() => {
    stopTyping(selectedUser.value.id.toString());
    typingTimeout.value = null;
  }, 1000);
}

function formatTimestamp(ts: string) {
  const date = new Date(ts);
  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}

onMounted(loadUsers);
</script>
