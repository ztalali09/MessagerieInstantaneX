import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { apiService, type User } from '../services/api';
import { generateAESKeyFromPassword, decryptPrivateKey } from '../crypto/aes';
import { secureStorage } from '../services/secureStorage';

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null);
  const isAuthReady = ref(false);
  const isAuthenticated = computed(() => !!currentUser.value);

  const login = async (username: string, password: string) => {
    const user = await apiService.login({ username, password });
    currentUser.value = user;
    await secureStorage.setItem('userId', user.id.toString());

    // Decrypt and store the private key
    const encryptedPrivateKey = await apiService.getEncryptedPrivateKey(
      user.id
    );
    // generateAESKeyFromPassword returns a Promise<CryptoKey>, so await it
    const aesKey = await generateAESKeyFromPassword(password);
    // decryptPrivateKey is async and returns the decrypted PEM, so await it as well
    const privateKey = await decryptPrivateKey(encryptedPrivateKey, aesKey);
    await secureStorage.setItem('privateKey', privateKey);

    return user;
  };

  const register = async (username: string, password: string) => {
    const result = await apiService.register({ username, password });
    // After registration, automatically log in
    const user = await apiService.login({ username, password });
    currentUser.value = user;
    await secureStorage.setItem('userId', user.id.toString());

    // Get and decrypt the private key from the backend
    const encryptedPrivateKey = await apiService.getEncryptedPrivateKey(
      user.id
    );
    const aesKey = await generateAESKeyFromPassword(password);
    const privateKey = await decryptPrivateKey(encryptedPrivateKey, aesKey);
    await secureStorage.setItem('privateKey', privateKey);

    return result;
  };

  const logout = async () => {
    currentUser.value = null;
    await secureStorage.removeItem('userId');
    await secureStorage.removeItem('privateKey'); // Also remove the private key on logout
  };

  const initializeAuth = async (userId?: string | null) => {
    if (!userId) {
      userId = await secureStorage.getItem('userId');
    }
    
    if (userId) {
      try {
        // directly assign to avoid redundant local variable
        currentUser.value = await apiService.getUser(parseInt(userId));
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // If user not found or error, clear secure storage
        await secureStorage.removeItem('userId');
        await secureStorage.removeItem('privateKey');
      }
    }
  };

  return {
    currentUser,
    isAuthenticated,
    login,
    register,
    logout,
    initializeAuth,
    isAuthReady,
    setAuthReady: (value: boolean) => { isAuthReady.value = value; },
  };
});
