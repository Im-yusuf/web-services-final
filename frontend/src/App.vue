<!-- Root component — sets the dark background and renders the current route.
     On mount, restores the auth state from localStorage so the session persists
     across page refreshes. -->
<template>
  <div class="min-h-screen bg-dark-900">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

onMounted(() => {
  authStore.loadFromStorage();
});
</script>
