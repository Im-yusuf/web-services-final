<!-- Reusable stat card for the dashboard. Accepts a title, value, optional icon,
     subtitle, and format (currency | number | none) for flexible display. -->
<template>
  <div class="card">
    <div class="flex items-center justify-between mb-2">
      <span class="text-sm font-medium text-gray-400">{{ title }}</span>
      <span class="text-lg">{{ icon }}</span>
    </div>
    <p class="text-2xl font-bold text-white">{{ formattedValue }}</p>
    <p v-if="subtitle" class="text-sm text-gray-500 mt-1">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  value: number | string;
  icon?: string;
  subtitle?: string;
  format?: 'currency' | 'number' | 'none';
}>();

const formattedValue = computed(() => {
  if (props.format === 'currency' && typeof props.value === 'number') {
    return `£${props.value.toLocaleString()}`;
  }
  if (props.format === 'number' && typeof props.value === 'number') {
    return props.value.toLocaleString();
  }
  return String(props.value);
});
</script>
