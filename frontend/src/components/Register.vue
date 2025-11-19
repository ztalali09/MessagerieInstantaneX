<template>
  <div class="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
    <div class="w-full max-w-md space-y-8 rounded-2xl border border-white/5 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
      <div class="text-center">
        <h2 class="font-display text-3xl font-bold tracking-tight text-white">Create an account</h2>
        <p class="mt-2 text-sm text-zinc-400">Join MessageX today</p>
      </div>

      <form @submit.prevent="handleRegister" class="mt-8 space-y-6">
        <div class="space-y-5">
          <div>
            <label for="username" class="block text-sm font-medium text-zinc-300">Username</label>
            <div class="mt-2">
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                minlength="3"
                class="block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                placeholder="Choose a username"
              />
              <p class="mt-1 text-xs text-zinc-500">At least 3 characters</p>
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
                minlength="6"
                class="block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                placeholder="Create a password"
              />
              <p class="mt-1 text-xs text-zinc-500">At least 6 characters</p>
            </div>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-zinc-300">Confirm Password</label>
            <div class="mt-2">
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                required
                class="block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                placeholder="Confirm your password"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading || !isFormValid"
          class="flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span v-if="loading" class="mr-2">
            <svg class="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          {{ loading ? 'Creating account...' : 'Create account' }}
        </button>
      </form>

      <p class="text-center text-sm text-zinc-400">
        Already have an account?
        <router-link to="/login" class="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Sign in</router-link>
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';

const router = useRouter();
const userStore = useUserStore();

const form = ref({
  username: '',
  password: '',
});

const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');

const isFormValid = computed(() => {
  return form.value.username.length >= 3 &&
         form.value.password.length >= 6 &&
         form.value.password === confirmPassword.value;
});

const handleRegister = async () => {
  if (!isFormValid.value) return;

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    const result = await userStore.register(form.value.username, form.value.password);
    success.value = result.message || 'Account created successfully!';
    // Reset form
    form.value = { username: '', password: '' };
    confirmPassword.value = '';
    // Redirect to chat after success (since register also logs in)
    setTimeout(() => {
      router.push('/chat');
    }, 2000);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Registration failed';
  } finally {
    loading.value = false;
  }
};
</script>
