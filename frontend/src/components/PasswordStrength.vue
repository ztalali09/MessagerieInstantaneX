<template>
  <div v-if="password" class="mt-2 space-y-1">
    <div class="flex gap-1">
      <div v-for="i in 4" :key="i" :class="['h-1 flex-1 transition-all', i <= strength ? strengthColors[strength] : 'bg-green-500/10']"></div>
    </div>
    <div class="flex items-center justify-between text-xs font-mono">
      <span :class="strengthColors[strength]">{{ strengthText }}</span>
      <span class="text-green-800">{{ score }}/4</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  password: string;
}

const props = defineProps<Props>();

const strength = computed(() => {
  const pwd = props.password;
  if (!pwd) return 0;
  
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;
  
  return Math.min(Math.floor(score / 1.5), 4);
});

const score = computed(() => strength.value);

const strengthText = computed(() => {
  const texts = ['', '[WEAK]', '[FAIR]', '[GOOD]', '[STRONG]'];
  return texts[strength.value];
});

const strengthColors = computed(() => [
  '',
  'bg-red-500 text-red-500',
  'bg-yellow-500 text-yellow-500',
  'bg-blue-500 text-blue-500',
  'bg-green-500 text-green-500'
]);
</script>


