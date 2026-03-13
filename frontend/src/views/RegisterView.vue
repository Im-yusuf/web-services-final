<!-- Registration page — includes confirm-password validation.
     Redirects to /dashboard after successful account creation. -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-dark-950 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary-500">🏠 EcoNest</h1>
        <p class="text-gray-400 mt-2">Create your account</p>
      </div>

      <div class="card">
        <h2 class="text-xl font-semibold mb-6">Register</h2>

        <form @submit.prevent="handleRegister" class="space-y-4">
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
              placeholder="Min 8 characters"
              required
              minlength="8"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
            <input
              v-model="confirmPassword"
              type="password"
              class="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <div v-if="localError" class="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">
            {{ localError }}
          </div>

          <div v-if="authStore.error" class="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">
            {{ authStore.error }}
          </div>

          <button
            type="submit"
            class="btn-primary w-full"
            :disabled="authStore.loading"
          >
            {{ authStore.loading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <p class="text-center text-gray-400 text-sm mt-6">
          Already have an account?
          <router-link to="/login" class="text-primary-400 hover:text-primary-300">
            Sign in
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
const confirmPassword = ref('');
const localError = ref('');

async function handleRegister() {
  localError.value = '';

  if (password.value !== confirmPassword.value) {
    localError.value = 'Passwords do not match';
    return;
  }

  try {
    await authStore.register(email.value, password.value);
    router.push('/dashboard');
  } catch {
    // Error is handled by the store
  }
}
</script>
