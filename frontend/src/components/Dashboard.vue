<template>
  <div class="min-h-screen bg-zinc-950">
    <header class="border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <h1 class="font-display text-xl font-bold text-white">Dashboard</h1>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- Welcome Card -->
        <div class="col-span-full rounded-2xl border border-white/5 bg-zinc-900/50 p-6 shadow-lg backdrop-blur-xl">
          <h2 class="font-display text-2xl font-bold text-white">Hello, {{ currentUser?.username }}!</h2>
          <p class="mt-2 text-zinc-400">You are now logged into MessageX. This is your personal dashboard.</p>
        </div>

        <!-- Stats Card -->
        <div class="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 shadow-lg backdrop-blur-xl">
          <h3 class="text-sm font-medium text-zinc-400">Platform Stats</h3>
          <div class="mt-4 grid grid-cols-2 gap-4">
            <div class="rounded-xl bg-white/5 p-4">
              <span class="block text-2xl font-bold text-white">{{ users.length }}</span>
              <span class="text-xs text-zinc-500">Total Users</span>
            </div>
            <div class="rounded-xl bg-white/5 p-4">
              <span class="block text-2xl font-bold text-white">{{ currentUser?.id }}</span>
              <span class="text-xs text-zinc-500">Your ID</span>
            </div>
          </div>
        </div>

        <!-- Users List -->
        <div class="col-span-full lg:col-span-2 rounded-2xl border border-white/5 bg-zinc-900/50 p-6 shadow-lg backdrop-blur-xl">
          <h3 class="mb-4 text-sm font-medium text-zinc-400">All Users</h3>
          
          <div v-if="loading" class="flex justify-center py-8">
            <div class="h-6 w-6 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent"></div>
          </div>
          
          <div v-else-if="users.length === 0" class="py-8 text-center text-zinc-500">
            No users found
          </div>
          
          <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="user in users"
              :key="user.id"
              @click="goToChat(user)"
              class="group flex cursor-pointer items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 transition-all hover:border-indigo-500/30 hover:bg-white/10"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-medium text-white shadow-lg shadow-indigo-500/20">
                {{ user.username.charAt(0).toUpperCase() }}
              </div>
              <div>
                <h4 class="text-sm font-medium text-zinc-200 group-hover:text-white">{{ user.username }}</h4>
                <p class="text-xs text-zinc-500">Joined {{ formatDate(user.created_at) }}</p>
              </div>
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
import { useUserStore } from '../stores/userStore';

const router = useRouter();
const userStore = useUserStore(); // Added userStore usage
const users = ref<User[]>([]);
const loading = ref(false);
const currentUser = ref<User | null>(userStore.currentUser); // Use store user

onMounted(async () => {
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};
</script>
