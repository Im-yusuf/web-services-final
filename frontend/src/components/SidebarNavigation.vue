<!-- App sidebar navigation — renders nav links with active-route highlighting.
     Includes the EcoNest logo at the top and a version footer at the bottom. -->
<template>
  <aside class="w-64 bg-dark-800 border-r border-dark-700 flex flex-col">
    <!-- Logo -->
    <div class="h-16 flex items-center px-6 border-b border-dark-700">
      <router-link to="/dashboard" class="flex items-center gap-2">
        <span class="text-2xl">🏠</span>
        <span class="text-xl font-bold text-primary-500">EcoNest</span>
      </router-link>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 py-4 px-3 space-y-1">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="isActive(item.path) ? 'sidebar-link-active' : 'sidebar-link'"
      >
        <span class="text-lg">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Footer -->
    <div class="px-6 py-4 border-t border-dark-700">
      <p class="text-xs text-gray-500">EcoNest v1.0</p>
      <p class="text-xs text-gray-600 mt-1">UK Housing Insights</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/trends', label: 'Price Trends', icon: '📈' },
  { path: '/heatmap', label: 'Regional Heatmap', icon: '🗺️' },
  { path: '/properties', label: 'Properties', icon: '🏘️' },
  { path: '/saved', label: 'Saved Listings', icon: '💾' },
  { path: '/compare', label: 'Compare', icon: '⚖️' },
];

function isActive(path: string): boolean {
  return route.path === path;
}
</script>
