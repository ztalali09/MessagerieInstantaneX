<template>
  <Transition name="slide">
    <div v-if="!isOnline || isReconnecting" class="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-red-500/90 text-white font-mono text-sm font-bold backdrop-blur-xl border-2 border-red-600 matrix-box-glow">
      <div class="flex items-center gap-3">
        <div class="h-2 w-2 rounded-full bg-white animate-pulse"></div>
        <span v-if="!isOnline">[CONNECTION_LOST] Attempting to reconnect...</span>
        <span v-else>[RECONNECTING]</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useConnectionStatus } from '../composables/useConnectionStatus';

const { isOnline, isReconnecting } = useConnectionStatus();
</script>

<style scoped>
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from {
  transform: translate(-50%, -100%);
  opacity: 0;
}
.slide-leave-to {
  transform: translate(-50%, -100%);
  opacity: 0;
}
</style>


