import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { apiService, type User } from '../services/api';

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null);
  const isAuthenticated = computed(() => !!currentUser.value);

  const login = async (username: string, password: string) => {
    try {
      const user = await apiService.login({ username, password });
      currentUser.value = user;
      localStorage.setItem('userId', user.id.toString());
      return user;
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const result = await apiService.register({ username, password });
      // After registration, automatically log in
      const user = await apiService.login({ username, password });
      currentUser.value = user;
      localStorage.setItem('userId', user.id.toString());
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    currentUser.value = null;
    localStorage.removeItem('userId');
  };

  const initializeAuth = async () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        const user = await apiService.getUser(parseInt(userId));
        currentUser.value = user;
      } catch (error) {
        // If user not found or error, clear localStorage
        localStorage.removeItem('userId');
      }
    }
  };

  return {
    currentUser,
    isAuthenticated,
    login,
    register,
    logout,
    initializeAuth
  };
});
