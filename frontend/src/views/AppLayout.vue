<!-- Authenticated layout shell — sidebar + top header + main content area.
     Also renders a floating comparison bar when properties are queued for comparison. -->
<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <SidebarNavigation />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Header -->
      <header class="h-16 bg-dark-800 border-b border-dark-700 flex items-center justify-between px-6">
        <h1 class="text-lg font-semibold text-gray-100">
          {{ currentPageTitle }}
        </h1>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-400">{{ authStore.user?.email }}</span>
          <button @click="handleLogout" class="text-sm text-gray-400 hover:text-white transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-6 bg-dark-950">
        <router-view />
      </main>

      <!-- Floating comparison bar — visible when properties are queued for comparison -->
      <div
        v-if="comparisonStore.count > 0 && route.name !== 'Compare'"
        class="border-t border-dark-700 bg-dark-800 px-6 py-3 flex items-center justify-between"
      >
        <span class="text-sm text-gray-300">
          <span class="font-semibold text-primary-400">{{ comparisonStore.count }}</span> / 3 properties selected for comparison
        </span>
        <div class="flex gap-2">
          <button @click="comparisonStore.clear()" class="btn-secondary text-xs px-3 py-1.5">Clear</button>
          <router-link to="/compare" class="btn-primary text-xs px-3 py-1.5">View Comparison</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useComparisonStore } from '@/stores/comparison';
import SidebarNavigation from '@/components/SidebarNavigation.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const comparisonStore = useComparisonStore();

const currentPageTitle = computed(() => {
  const titles: Record<string, string> = {
    Dashboard: 'Dashboard Overview',
    Trends: 'Price Trends',
    Heatmap: 'Regional Heatmap',
    Properties: 'Browse Properties',
    Saved: 'Saved Listings',
    Compare: 'Compare Properties',
  };
  return titles[route.name as string] || 'EcoNest';
});

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>
