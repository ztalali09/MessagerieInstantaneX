<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">MessageX</router-link>
      </div>

      <div v-if="isAuthenticated" class="navbar-user">
        <div class="user-info">
          <span class="username">{{ currentUser?.username }}</span>
          <button @click="logout" class="logout-btn">Logout</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';

const userStore = useUserStore();
const router = useRouter();

const isAuthenticated = computed(() => userStore.isAuthenticated);
const currentUser = computed(() => userStore.currentUser);

const logout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.navbar {
  background: #fff;
  border-bottom: 1px solid #e1e5e9;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.navbar-brand .brand-link {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  text-decoration: none;
}

.navbar-user {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username {
  font-weight: 500;
  color: #333;
}

.logout-btn {
  background: #dc3545;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background: #c82333;
}
</style>
