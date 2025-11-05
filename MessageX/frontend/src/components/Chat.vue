<template>
  <div class="chat-container">
    <div class="sidebar">
      <div class="user-list">
        <div
          v-for="user in users"
          :key="user.id"
          class="user-item"
          @click="selectUser(user)"
          :class="{ selected: selectedUser && selectedUser.id === user.id }"
        >
          <div class="user-avatar">{{ user.username.charAt(0).toUpperCase() }}</div>
          <div class="user-info">
            <h4>{{ user.username }}</h4>
            <div class="user-status">
              <span
                class="status-indicator"
                :class="{ online: onlineUsers.includes(user.id.toString()) }"
              ></span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-area">
      <div v-if="selectedUser" class="chat-header">
        <div class="user-avatar">{{ selectedUser.username.charAt(0).toUpperCase() }}</div>
        <h2>{{ selectedUser.username }}</h2>
      </div>
      <div class="messages">
        <div
          v-for="msg in conversationMessages"
          :key="msg.id || (msg.timestamp + msg.message)"
          :class="['message', msg.from_user_id == currentUserId ? 'sent' : 'received']"
        >
          <span class="msg-content">
            {{ msg.message }}
          </span>
          <span class="msg-time">{{ formatTimestamp(msg.timestamp) }}</span>
        </div>
        <!-- Typing indicator -->
        <div v-if="isUserTyping" class="typing-indicator">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span class="typing-text">{{ selectedUser?.username }} is typing...</span>
        </div>
      </div>
      <form class="chat-input" @submit.prevent="handleSendMessage">
        <input
          v-model="messageText"
          type="text"
          placeholder="Type a message..."
          autocomplete="off"
          @input="handleInput"
        />
        <button type="submit">Send</button>
      </form>
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
const typingTimeout = ref(null);

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
  const messagesContainer = document.querySelector('.messages');
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
  sendMessage(selectedUser.value.id, messageText.value);
  messageText.value = '';

  // Stop typing indicator
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
    typingTimeout.value = null;
  }
  stopTyping(selectedUser.value.id);
}

function handleInput() {
  if (!selectedUser.value) return;

  // Start typing indicator
  startTyping(selectedUser.value.id);

  // Clear existing timeout
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }

  // Set timeout to stop typing indicator after 1 second of no input
  typingTimeout.value = setTimeout(() => {
    stopTyping(selectedUser.value.id);
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

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  flex-direction: column;
}

.sidebar {
  width: 100%;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ccc;
  overflow-y: auto;
  max-height: 30vh;
}

.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  overflow-x: auto;
}

.user-item {
  padding: 10px;
  cursor: pointer;
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: transparent;
  transition: background 0.2s;
  min-width: 80px;
  flex-shrink: 0;
}

.user-item.selected,
.user-item:hover {
  background-color: #e0e0e0;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 5px;
}

.user-info h4 {
  margin: 0;
  color: #333;
  font-size: 0.8rem;
  text-align: center;
}

.user-status {
  display: flex;
  justify-content: center;
  margin-top: 2px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #666; /* offline - black/gray */
  border: 1px solid #ccc;
}

.status-indicator.online {
  background-color: #28a745; /* online - green */
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fafbfc;
}

/* Desktop styles */
@media (min-width: 768px) {
  .chat-container {
    flex-direction: row;
  }

  .sidebar {
    width: 25%;
    border-bottom: none;
    border-right: 1px solid #ccc;
    max-height: none;
  }

  .user-list {
    flex-direction: column;
    overflow-x: visible;
    overflow-y: auto;
  }

  .user-item {
    flex-direction: row;
    border-right: none;
    border-bottom: 1px solid #ccc;
    min-width: auto;
    padding: 15px;
  }

  .user-avatar {
    margin-bottom: 0;
    margin-right: 1rem;
  }

  .user-info h4 {
    font-size: 1rem;
    text-align: left;
  }

  .user-status {
    justify-content: flex-start;
  }
}

.chat-header {
  padding: 15px;
  border-bottom: 1px solid #ccc;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
}

.chat-header .user-avatar {
  margin-right: 1rem;
}

.chat-header h2 {
  margin: 0;
}

.messages {
  flex-grow: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.message {
  margin-bottom: 10px;
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 60%;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  word-break: break-word;
}

.message.sent {
  align-self: flex-end;
  background-color: #007bff;
  color: white;
}

.message.received {
  align-self: flex-start;
  background-color: #e6ecef;
  color: #2d2d2d;
}

.msg-content {
  margin-bottom: 2px;
}

.msg-time {
  font-size: 0.75rem;
  color: #888;
  align-self: flex-end;
}

.chat-input {
  display: flex;
  padding: 15px;
  border-top: 1px solid #ccc;
  background: #fff;
}

.chat-input input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
}

.chat-input button {
  padding: 10px 15px;
  margin-left: 10px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

.chat-input button:hover {
  background-color: #0056b3;
}

/* Typing indicator styles */
.typing-indicator {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 10px;
  align-self: flex-start;
}

.typing-dots {
  display: flex;
  gap: 4px;
  margin-right: 8px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #666;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

.typing-text {
  font-size: 0.8rem;
  color: #666;
  font-style: italic;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
