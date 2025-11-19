<template>
  <div class="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
    <div class="w-full max-w-md space-y-8 rounded-2xl border border-white/5 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
      <div class="text-center">
        <h2 class="font-display text-3xl font-bold tracking-tight text-white">Welcome back</h2>
        <p class="mt-2 text-sm text-zinc-400">Sign in to your account to continue</p>
      </div>

      <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
        <div class="space-y-5">
          <div>
            <label for="username" class="block text-sm font-medium text-zinc-300">Username</label>
            <div class="mt-2">
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                class="block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-zinc-300">Password</label>
            <div class="mt-2">
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                class="block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                placeholder="Enter your password"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span v-if="loading" class="mr-2">
            <svg class="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <p class="text-center text-sm text-zinc-400">
        Don't have an account?
        <router-link to="/register" class="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Create an account</router-link>
      </p>

      <div v-if="error" class="rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
        {{ error }}
      </div>

      <div v-if="success" class="rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-400 border border-emerald-500/20">
        {{ success }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';

const router = useRouter();
const userStore = useUserStore();

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
    setTimeout(() => {
      router.push('/chat');
    }, 1500);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Login failed';
  } finally {
    loading.value = false;
  }
};
</script>
