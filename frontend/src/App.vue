<template>
  <div id="app">
    <div v-if="!isAuthReady" class="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <div class="flex flex-col items-center space-y-4">
        <svg class="h-12 w-12 animate-spin text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-zinc-400 font-medium">Loading...</p>
      </div>
    </div>
    <div v-else>
      <Navbar v-if="isAuthenticated" />
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from './stores/userStore';
import Navbar from './components/Navbar.vue';

const userStore = useUserStore();
const isAuthenticated = computed(() => userStore.isAuthenticated);
const isAuthReady = computed(() => userStore.isAuthReady);

// onMounted removed as auth is handled in router guard
</script>

<style>
/* Global styles are now in styles.css */
</style>
