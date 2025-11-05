<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Join MessageX</h2>
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            placeholder="Choose a username"
            minlength="3"
          />
          <small class="form-hint">At least 3 characters</small>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            placeholder="Create a password"
            minlength="6"
          />
          <small class="form-hint">At least 6 characters</small>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            placeholder="Confirm your password"
          />
        </div>

        <button type="submit" :disabled="loading || !isFormValid" class="auth-button">
          {{ loading ? 'Creating account...' : 'Register' }}
        </button>
      </form>

      <p class="auth-link">
        Already have an account?
        <router-link to="/login">Login here</router-link>
      </p>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="success" class="success-message">
        {{ success }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { apiService, type RegisterData } from '../services/api';

const router = useRouter();

const form = ref<RegisterData>({
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
    const result = await apiService.register(form.value);
    success.value = result.message || 'Account created successfully!';
    // Reset form
    form.value = { username: '', password: '' };
    confirmPassword.value = '';
    // Redirect to login after success
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Registration failed';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.auth-card h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.8rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #555;
}

.form-group input {
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-hint {
  color: #666;
  font-size: 0.875rem;
}

.auth-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.auth-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

.auth-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.auth-link a:hover {
  text-decoration: underline;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fee;
  color: #c33;
  border-radius: 6px;
  text-align: center;
  border: 1px solid #fcc;
}

.success-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #efe;
  color: #363;
  border-radius: 6px;
  text-align: center;
  border: 1px solid #cfc;
}
</style>
