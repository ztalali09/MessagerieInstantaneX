// Simplified storage service using localStorage as requested
class SecureStorageService {
  privateKeyKey = 'privateKey';
  userIdKey = 'userId';

  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
  }
}

export const secureStorage = new SecureStorageService();
