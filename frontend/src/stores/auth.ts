// Pinia authentication store — manages login/register state, persists
// the session token and user object in localStorage, and exposes
// an isAuthenticated computed for use in route guards and UI.
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/services/authService';
import type { User } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  function loadFromStorage() {
    const storedToken = localStorage.getItem('econest_token');
    const storedUser = localStorage.getItem('econest_user');
    if (storedToken && storedUser) {
      token.value = storedToken;
      try {
        user.value = JSON.parse(storedUser);
      } catch {
        logout();
      }
    }
  }

  async function register(email: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      const result = await authService.register(email, password);
      user.value = result.user;
      token.value = result.token;
      localStorage.setItem('econest_token', result.token);
      localStorage.setItem('econest_user', JSON.stringify(result.user));
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Registration failed';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      const result = await authService.login(email, password);
      user.value = result.user;
      token.value = result.token;
      localStorage.setItem('econest_token', result.token);
      localStorage.setItem('econest_user', JSON.stringify(result.user));
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Login failed';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await authService.logout();
    } catch {
      // Server-side cleanup failed — still clear local state
    }
    user.value = null;
    token.value = null;
    localStorage.removeItem('econest_token');
    localStorage.removeItem('econest_user');
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    loadFromStorage,
    register,
    login,
    logout,
  };
});
