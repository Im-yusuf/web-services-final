// Frontend authentication service — wraps the /api/auth endpoints.
import api from './api';
import type { ApiResponse, AuthResponse } from '@/types';

export const authService = {
  async register(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
      email,
      password,
    });
    return data.data!;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    return data.data!;
  },

  async me() {
    const { data } = await api.get('/auth/me');
    return data.data;
  },
};
