const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface RegisterData {
  username: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  async register(
    data: RegisterData
  ): Promise<{ id: number; username: string; message: string }> {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData): Promise<User> {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUsers(): Promise<User[]> {
    const response = await this.request<{ users: User[]; count: number }>(
      '/users'
    );
    return response.users;
  }

  async getUser(id: number): Promise<User> {
    return this.request(`/users/${id}`);
  }

  async getEncryptedPrivateKey(userId: number): Promise<string> {
    const response = await this.request<{ encryptedPrivateKey: string }>(
      `/users/${userId}/private-key`
    );
    return response.encryptedPrivateKey;
  }
}

export const apiService = new ApiService();
