<!-- Login page — email + password form that redirects to /dashboard on success.
     Error messages are displayed inline from the auth store. -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-dark-950 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary-500">🏠 EcoNest</h1>
        <p class="text-gray-400 mt-2">UK Housing & Rental Insights</p>
      </div>

      <div class="card">
        <h2 class="text-xl font-semibold mb-6">Sign In</h2>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              v-model="email"
              type="email"
              class="input-field"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              v-model="password"
              type="password"
              class="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <div v-if="authStore.error" class="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">
            {{ authStore.error }}
          </div>

          <button
            type="submit"
            class="btn-primary w-full"
            :disabled="authStore.loading"
          >
            {{ authStore.loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="text-center text-gray-400 text-sm mt-6">
          Don't have an account?
          <router-link to="/register" class="text-primary-400 hover:text-primary-300">
            Create one
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');

async function handleLogin() {
  try {
    await authStore.login(email.value, password.value);
    router.push('/dashboard');
  } catch {
    // Error is handled by the store
  }
}
</script>
