<template>
  <div id="app">
    <Navbar v-if="isAuthenticated" />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useUserStore } from './stores/userStore';
import Navbar from './components/Navbar.vue';

const userStore = useUserStore();
const isAuthenticated = computed(() => userStore.isAuthenticated);

onMounted(() => {
  userStore.initializeAuth();
});
</script>

<style>
/* Global styles are now in styles.css */
</style>
