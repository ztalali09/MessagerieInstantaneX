<template>
  <div class="chat-container">
    <div class="sidebar">
      <div class="user-list">
        <div
          v-for="user in users"
          :key="user.id"
          class="user-item"
          @click="selectUser(user)"
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
        <!-- Messages will go here -->
      </div>
      <div class="chat-input">
        <input type="text" placeholder="Type a message..." />
        <button>Send</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiService, type User } from '../services/api';

const users = ref<User[]>([]);
const loading = ref(false);
const selectedUser = ref<User | null>(null);

onMounted(async () => {
  await loadUsers();
});

const loadUsers = async () => {
  loading.value = true;
  try {
    users.value = await apiService.getUsers();
    if (users.value.length > 0) {
      selectedUser.value = users.value[0];
    }
  } catch (error) {
    console.error('Failed to load users:', error);
  } finally {
    loading.value = false;
  }
};

const selectUser = (user: User) => {
  selectedUser.value = user;
};
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
}

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
}

.chat-input {
  display: flex;
  padding: 15px;
  border-top: 1px solid #ccc;
}

.chat-input input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
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

