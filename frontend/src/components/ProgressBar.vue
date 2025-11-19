<template>
  <div v-if="visible" class="fixed bottom-4 right-4 z-40 w-80 bg-black/90 border-2 border-green-500 p-4 backdrop-blur-xl matrix-box-glow">
    <div class="flex items-center justify-between mb-2 font-mono text-sm">
      <span class="text-green-500 font-bold uppercase">{{ title }}</span>
      <span class="text-green-700">{{ progress }}%</span>
    </div>
    <div class="h-2 bg-green-500/10 border border-green-500/30 overflow-hidden">
      <div class="h-full bg-green-500 transition-all duration-300 matrix-glow-subtle" :style="{ width: `${progress}%` }"></div>
    </div>
    <div v-if="message" class="mt-2 text-xs text-green-700 font-mono">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean;
  progress: number;
  title: string;
  message?: string;
}

defineProps<Props>();
</script>


