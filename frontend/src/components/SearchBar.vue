<template>
  <div class="relative">
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        class="matrix-input w-full pl-10 pr-10 py-2 text-sm"
        @input="emit('search', searchQuery)"
        @keydown.escape="clear"
      />
      <div class="absolute left-3 top-1/2 -translate-y-1/2 text-green-500">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </div>
      <button
        v-if="searchQuery"
        @click="clear"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-400 transition-colors"
      >
        &times;
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  placeholder?: string;
}

withDefaults(defineProps<Props>(), {
  placeholder: '> SEARCH...'
});

const emit = defineEmits(['search']);
const searchQuery = ref('');

const clear = () => {
  searchQuery.value = '';
  emit('search', '');
};
</script>

