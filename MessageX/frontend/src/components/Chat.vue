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
          :key="msg.timestamp + msg.message"
          :class="['message', msg.from === currentUserId ? 'sent' : 'received']"
        >
          <span class="msg-content">
            {{ msg.message }}
          </span>
          <span class="msg-time">{{ formatTimestamp(msg.timestamp) }}</span>
        </div>
      </div>
      <form class="chat-input" @submit.prevent="handleSendMessage">
        <input
          v-model="messageText"
          type="text"
          placeholder="Type a message..."
          autocomplete="off"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { apiService, type User } from '../services/api';
import { useSocket } from '../services/useSocket';
import { useUserStore } from '../stores/userStore';

const userStore = useUserStore();
const users = ref<User[]>([]);
const loading = ref(false);
const selectedUser = ref<User | null>(null);
const messageText = ref('');
const currentUserId = userStore.currentUser?.id.toString() || '';

const { messages, sendMessage } = useSocket();

const conversationMessages = computed(() => {
  if (!selectedUser.value) return [];
  return messages.value.filter(
    m =>
      (m.from === currentUserId && m.to === selectedUser.value?.id) ||
      (m.to === currentUserId && m.from === selectedUser.value?.id)
  );
});

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
  sendMessage(selectedUser.value.id, messageText.value, currentUserId);
  messageText.value = '';
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
}

.sidebar {
  width: 25%;
  background-color: #f0f0f0;
  border-right: 1px solid #ccc;
  overflow-y: auto;
}

.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.user-item {
  padding: 15px;
  cursor: pointer;
  border-bottom: 1px solid #ccc;
  display: flex;
  align-items: center;
  background-color: transparent;
  transition: background 0.2s;
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
  margin-right: 1rem;
}

.user-info h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
}

.chat-area {
  width: 75%;
  display: flex;
  flex-direction: column;
  background: #fafbfc;
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
</style>
