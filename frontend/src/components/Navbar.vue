<template>
  <nav class="sticky top-0 z-50 w-full border-b backdrop-blur-xl matrix-box-glow flex-shrink-0" style="border-color: var(--matrix-dark); background: var(--bg-secondary);">
    <div class="mx-auto flex h-14 md:h-14 max-w-7xl items-center justify-between px-3 md:px-4 lg:px-8 gap-2">
      <div class="flex items-center min-w-0 flex-1">
        <router-link to="/chat" class="flex items-center gap-1.5 md:gap-2 text-xs md:text-lg font-bold tracking-wider transition-all active:opacity-80 md:hover-matrix-glow font-mono" style="color: var(--matrix-normal);">
          <div class="flex h-7 w-7 md:h-8 md:w-8 flex-shrink-0 items-center justify-center border-2 shadow-lg matrix-glow-subtle" style="background: var(--bg-primary); border-color: var(--matrix-normal);">
            <span class="text-xs md:text-sm font-bold" style="color: var(--matrix-bright);">X</span>
          </div>
          <span class="hidden xs:inline text-[10px] sm:text-xs md:text-base">&gt; THE_X_MSG</span>
          <span class="xs:hidden text-[10px]">&gt; X</span>
        </router-link>
      </div>

      <div v-if="isAuthenticated" class="flex items-center gap-1.5 md:gap-4 flex-shrink-0">
        <div class="flex items-center gap-1 md:gap-3 border border-green-500 bg-green-500/10 px-1.5 md:px-3 py-1 md:py-1.5 backdrop-blur-sm">
          <div class="h-1.5 w-1.5 md:h-2 md:w-2 flex-shrink-0 bg-green-500 shadow-[0_0_8px_rgba(0,255,65,0.8)] matrix-glow-subtle"></div>
          <span class="text-[10px] md:text-sm font-bold text-green-500 font-mono truncate max-w-[60px] xs:max-w-[80px] sm:max-w-[120px] md:max-w-none">[{{ currentUser?.username }}]</span>
        </div>
        <button 
          @click="logout" 
          class="group relative overflow-hidden bg-transparent border border-green-500 px-2 md:px-4 py-1.5 md:py-1.5 text-[10px] md:text-sm font-bold text-green-500 transition-all active:bg-green-500/30 md:hover:bg-green-500/20 hover-matrix-glow font-mono touch-manipulation min-h-[36px]"
        >
          <span class="hidden xs:inline">[OUT]</span><span class="xs:hidden">⏻</span>
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
