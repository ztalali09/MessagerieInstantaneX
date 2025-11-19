<template>
  <Transition name="toast">
    <div v-if="visible" :class="['fixed top-4 right-4 z-50 min-w-[300px] max-w-md p-4 border-2 font-mono text-sm backdrop-blur-xl matrix-fade-in', toastClasses]">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 text-lg">{{ icon }}</div>
        <div class="flex-1">
          <div class="font-bold uppercase tracking-wide">{{ title }}</div>
          <div v-if="message" class="mt-1 text-xs opacity-80">{{ message }}</div>
        </div>
        <button @click="close" class="flex-shrink-0 hover:opacity-70 transition-opacity">✕</button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface Props {
  type?: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000
});

const emit = defineEmits(['close']);
const visible = ref(false);

const toastClasses = computed(() => {
  const classes = {
    success: 'bg-green-500/10 border-green-500 text-green-500',
    error: 'bg-red-500/10 border-red-500 text-red-500',
    info: 'bg-blue-500/10 border-blue-500 text-blue-500',
    warning: 'bg-yellow-500/10 border-yellow-500 text-yellow-500'
  };
  return classes[props.type];
});

const icon = computed(() => {
  const icons = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
    warning: '⚠'
  };
  return icons[props.type];
});

const close = () => {
  visible.value = false;
  setTimeout(() => emit('close'), 300);
};

onMounted(() => {
  visible.value = true;
  if (props.duration > 0) {
    setTimeout(close, props.duration);
  }
});
</script>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>


