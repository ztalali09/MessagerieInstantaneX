<template>
  <nav class="sticky top-0 z-50 w-full border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-900/50">
    <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <div class="flex items-center">
        <router-link to="/" class="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-80">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
            <span class="text-sm">M</span>
          </div>
          MessageX
        </router-link>
      </div>

      <div v-if="isAuthenticated" class="flex items-center gap-4">
        <div class="flex items-center gap-3 rounded-full border border-white/5 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
          <div class="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
          <span class="text-sm font-medium text-zinc-300">{{ currentUser?.username }}</span>
        </div>
        <button 
          @click="logout" 
          class="group relative overflow-hidden rounded-lg bg-white/5 px-4 py-1.5 text-sm font-medium text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
        >
          Logout
        </button>
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
