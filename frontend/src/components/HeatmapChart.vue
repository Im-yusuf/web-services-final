<!-- Horizontal bar chart showing average house prices per region.
     Colour-codes bars from green (low) to red (high) relative to the max price.
     Displays the top 25 regions sorted by price descending. -->
<template>
  <div class="card">
    <h3 class="text-lg font-semibold mb-4">{{ title }}</h3>
    <div class="h-96">
      <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
      <div v-else class="h-full flex items-center justify-center text-gray-500">
        No heatmap data available
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { HeatmapData } from '@/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const props = defineProps<{
  title: string;
  data: HeatmapData[];
}>();

function priceToColor(price: number, max: number): string {
  const ratio = Math.min(price / max, 1);
  // Green (low) to Red (high)
  const r = Math.round(255 * ratio);
  const g = Math.round(255 * (1 - ratio * 0.6));
  const b = 80;
  return `rgba(${r}, ${g}, ${b}, 0.8)`;
}

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) return null;

  const sorted = [...props.data].sort((a, b) => b.avgPrice - a.avgPrice).slice(0, 25);
  const maxPrice = sorted[0]?.avgPrice || 1;

  return {
    labels: sorted.map((d) => d.region),
    datasets: [
      {
        label: 'Average Price (£)',
        data: sorted.map((d) => d.avgPrice),
        backgroundColor: sorted.map((d) => priceToColor(d.avgPrice, maxPrice)),
        borderColor: sorted.map((d) => priceToColor(d.avgPrice, maxPrice)),
        borderWidth: 1,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y' as const,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => `£${ctx.parsed.x.toLocaleString()}`,
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#64748b',
        callback: (val: any) => `£${(val / 1000).toFixed(0)}k`,
      },
      grid: { color: 'rgba(100, 116, 139, 0.1)' },
    },
    y: {
      ticks: { color: '#94a3b8', font: { size: 10 } },
      grid: { display: false },
    },
  },
};
</script>
