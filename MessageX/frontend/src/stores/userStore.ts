import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { apiService, type User } from '../services/api';
import { generateRSAKeyPair, encryptWithPublicKey } from '../crypto/rsa';
import { generateAESKeyFromPassword, encryptPrivateKey, decryptPrivateKey } from '../crypto/aes';

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null);
  const isAuthenticated = computed(() => !!currentUser.value);

  const login = async (username: string, password: string) => {
    try {
      const user = await apiService.login({ username, password });
      currentUser.value = user;
      sessionStorage.setItem('userId', user.id.toString());

      // Decrypt and store the private key
      const encryptedPrivateKey = await apiService.getEncryptedPrivateKey(user.id);
      const aesKey = generateAESKeyFromPassword(password);
      const privateKey = decryptPrivateKey(encryptedPrivateKey, aesKey);
      sessionStorage.setItem('privateKey', privateKey);

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
      sessionStorage.setItem('userId', user.id.toString());

      // Get and decrypt the private key from the backend
      const encryptedPrivateKey = await apiService.getEncryptedPrivateKey(user.id);
      const aesKey = generateAESKeyFromPassword(password);
      const privateKey = decryptPrivateKey(encryptedPrivateKey, aesKey);
      sessionStorage.setItem('privateKey', privateKey);

      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    currentUser.value = null;
    sessionStorage.removeItem('userId');
  };

  const initializeAuth = async () => {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      try {
        const user = await apiService.getUser(parseInt(userId));
        currentUser.value = user;
      } catch (error) {
        // If user not found or error, clear sessionStorage
        sessionStorage.removeItem('userId');
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
