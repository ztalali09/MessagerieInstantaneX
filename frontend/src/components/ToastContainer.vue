<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
    <div v-for="toast in toasts" :key="toast.id" class="pointer-events-auto">
      <Toast
        :type="toast.type"
        :title="toast.title"
        :message="toast.message"
        :duration="0"
        @close="remove(toast.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast';
import Toast from './Toast.vue';

const { toasts, remove } = useToast();
</script>


