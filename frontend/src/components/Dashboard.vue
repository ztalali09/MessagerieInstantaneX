<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>Welcome to MessageX</h1>
      <button @click="logout" class="logout-button">Logout</button>
    </header>

    <main class="dashboard-content">
      <div class="welcome-card">
        <h2>Hello, {{ currentUser?.username }}!</h2>
        <p>You are now logged into MessageX. This is a simple dashboard to get you started.</p>
      </div>

      <div class="stats-card">
        <h3>Platform Stats</h3>
        <div class="stats">
          <div class="stat">
            <span class="stat-number">{{ users.length }}</span>
            <span class="stat-label">Total Users</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ currentUser?.id }}</span>
            <span class="stat-label">Your ID</span>
          </div>
        </div>
      </div>

      <div class="users-list">
        <h3>All Users</h3>
        <div v-if="loading" class="loading">Loading users...</div>
        <div v-else-if="users.length === 0" class="no-users">No users found</div>
        <div v-else class="users-grid">
          <div v-for="user in users" :key="user.id" class="user-card" @click="goToChat(user)">
            <div class="user-avatar">{{ user.username.charAt(0).toUpperCase() }}</div>
            <div class="user-info">
              <h4>{{ user.username }}</h4>
              <p>Joined {{ formatDate(user.created_at) }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { apiService, type User } from '../services/api';

const router = useRouter();
const users = ref<User[]>([]);
const loading = ref(false);
const currentUser = ref<User | null>(null);

onMounted(async () => {
  // In a real app, you'd get the current user from session/token
  // For now, we'll just load all users
  await loadUsers();
});

const goToChat = (user: User) => {
  router.push('/chat');
};

const loadUsers = async () => {
  loading.value = true;
  try {
    users.value = await apiService.getUsers();
  } catch (error) {
    console.error('Failed to load users:', error);
  } finally {
    loading.value = false;
  }
};

const logout = () => {
  currentUser.value = null;
  router.push('/login');
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f5f7fa;
}

.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dashboard-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.logout-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.logout-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.welcome-card, .stats-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.welcome-card h2 {
  margin-top: 0;
  color: #333;
}

.stats {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.users-list {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.users-list h3 {
  margin-top: 0;
  color: #333;
  margin-bottom: 1.5rem;
}

.loading, .no-users {
  text-align: center;
  color: #666;
  padding: 2rem;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.user-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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

.user-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .dashboard-content {
    padding: 1rem;
  }

  .stats {
    flex-direction: column;
    gap: 1rem;
  }

  .users-grid {
    grid-template-columns: 1fr;
  }
}
</style>
