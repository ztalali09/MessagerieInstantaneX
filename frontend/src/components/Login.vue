<template>
  <div class="flex h-full items-center justify-center p-4 md:p-4 overflow-y-auto">
    <div class="w-full max-w-md space-y-5 md:space-y-8 p-6 md:p-8 matrix-terminal matrix-box-glow-strong matrix-fade-in relative z-10 my-4">
      <div class="text-center">
        <h2 class="text-xl md:text-3xl font-bold tracking-wider matrix-glow matrix-glitch uppercase" style="color: var(--matrix-bright);">&gt; THE_X_MESSENGER</h2>
        <p class="mt-2 text-xs md:text-sm font-mono" style="color: var(--matrix-dim);">[SECURE_TERMINAL_ACCESS]</p>
      </div>

      <form @submit.prevent="handleLogin" class="mt-5 md:mt-8 space-y-4 md:space-y-6">
        <div class="space-y-4 md:space-y-5">
          <div>
            <label for="username" class="block text-xs md:text-sm font-bold text-green-500 font-mono uppercase mb-2">&gt; Username</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              autocomplete="username"
              class="matrix-input block w-full px-4 py-3 text-base"
              style="font-size: 16px !important;"
              placeholder="> ENTER_USERNAME"
            />
          </div>

          <div>
            <label for="password" class="block text-xs md:text-sm font-bold text-green-500 font-mono uppercase mb-2">&gt; Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              autocomplete="current-password"
              class="matrix-input block w-full px-4 py-3 text-base"
              style="font-size: 16px !important;"
              placeholder="> ENTER_PASSWORD"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="matrix-btn flex w-full justify-center items-center px-4 py-3.5 md:py-2.5 text-sm md:text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[48px]"
        >
          <span v-if="loading" class="mr-2">
            <svg class="h-5 w-5 animate-spin text-green-500 matrix-glow-subtle" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          {{ loading ? '[AUTHENTICATING...]' : '[LOGIN]' }}
        </button>
      </form>

      <p class="text-center text-xs md:text-sm text-green-700 font-mono">
        [NO_ACCOUNT?]
        <router-link to="/register" class="font-bold text-green-500 active:text-green-400 md:hover:text-green-400 hover-matrix-glow ml-2 transition-all touch-manipulation inline-block py-1">
          &gt; [REGISTER]
        </router-link>
      </p>

      <div v-if="error" class="border-2 border-red-500 bg-red-500/10 p-3 md:p-4 text-xs md:text-sm text-red-500 font-mono matrix-box-glow">
        [ERROR] {{ error }}
      </div>

      <div v-if="success" class="border-2 border-green-500 bg-green-500/10 p-3 md:p-4 text-xs md:text-sm text-green-500 font-mono matrix-box-glow">
        [SUCCESS] {{ success }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { useToast } from '../composables/useToast';

const router = useRouter();
const userStore = useUserStore();
const { success: showSuccess, error: showError } = useToast();

const form = ref({
  username: '',
  password: '',
});

const loading = ref(false);
const error = ref('');
const success = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    const user = await userStore.login(form.value.username, form.value.password);
    success.value = `Welcome back, ${user.username}!`;
    showSuccess('[ACCESS_GRANTED]', `Welcome, ${user.username}`);
    setTimeout(() => {
      router.push('/chat');
    }, 1500);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Login failed';
    showError('[ACCESS_DENIED]', err instanceof Error ? err.message : 'Login failed');
  } finally {
    loading.value = false;
  }
};
</script>
