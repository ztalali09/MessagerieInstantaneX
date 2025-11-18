import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { isPlatform } from '@ionic/vue';

class SecureStorageService {
  privateKeyKey = 'privateKey';
  userIdKey = 'userId';

  async setItem(key: string, value: string): Promise<void> {
    if (isPlatform('android') || isPlatform('ios')) {
      try {
        await SecureStorage.set(key, value);
      } catch (error) {
        console.error(
          `Error setting item in secure storage for ${key}:`,
          error
        );
        // Fallback to sessionStorage if secure storage fails
        sessionStorage.setItem(key, value);
      }
    } else {
      sessionStorage.setItem(key, value);
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (isPlatform('android') || isPlatform('ios')) {
      try {
        const ret = await SecureStorage.get(key);
        return ret !== null ? String(ret) : null;
      } catch (error) {
        console.error(
          `Error getting item from secure storage for ${key}:`,
          error
        );
        // Fallback to sessionStorage if secure storage fails
        return sessionStorage.getItem(key);
      }
    } else {
      return sessionStorage.getItem(key);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (isPlatform('android') || isPlatform('ios')) {
      try {
        await SecureStorage.remove(key);
      } catch (error) {
        console.error(
          `Error removing item from secure storage for ${key}:`,
          error
        );
        // Fallback to sessionStorage if secure storage fails
        sessionStorage.removeItem(key);
      }
    } else {
      sessionStorage.removeItem(key);
    }
  }
}

export const secureStorage = new SecureStorageService();
