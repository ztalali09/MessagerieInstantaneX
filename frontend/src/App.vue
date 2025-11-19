<template>
  <div id="app" class="relative h-full flex flex-col overflow-hidden" style="background: var(--bg-primary);">
    <MatrixRain />
    <ToastContainer />
    <ConnectionStatus />
    <Navbar v-if="isAuthenticated" class="flex-shrink-0" />
    <div class="relative flex-1 min-h-0 overflow-hidden">
      <router-view class="h-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useUserStore } from './stores/userStore';
import Navbar from './components/Navbar.vue';
import MatrixRain from './components/MatrixRain.vue';
import ToastContainer from './components/ToastContainer.vue';
import ConnectionStatus from './components/ConnectionStatus.vue';

const userStore = useUserStore();
const isAuthenticated = computed(() => userStore.isAuthenticated);

onMounted(() => {
  userStore.initializeAuth();
});
</script>

<style>
/* Global styles are now in styles.css */
</style>
