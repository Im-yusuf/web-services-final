<!-- Line chart for price trends over time using Chart.js.
     Takes an array of TrendData and renders a filled area chart
     with green styling and formatted price axis labels. -->
<template>
  <div class="card">
    <h3 class="text-lg font-semibold mb-4">{{ title }}</h3>
    <div class="h-80">
      <Line v-if="chartData" :data="chartData" :options="chartOptions" />
      <div v-else class="h-full flex items-center justify-center text-gray-500">
        No trend data available
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { TrendData } from '@/types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const props = defineProps<{
  title: string;
  data: TrendData[];
}>();

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) return null;

  const labels = props.data.map((d) => `${d.year}-${String(d.month).padStart(2, '0')}`);

  return {
    labels,
    datasets: [
      {
        label: 'Average Price (£)',
        data: props.data.map((d) => d.avgPrice),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#94a3b8' },
    },
    tooltip: {
      callbacks: {
        label: (ctx: any) => `£${ctx.parsed.y.toLocaleString()}`,
      },
    },
  },
  scales: {
    x: {
      ticks: { color: '#64748b', maxTicksLimit: 12 },
      grid: { color: 'rgba(100, 116, 139, 0.1)' },
    },
    y: {
      ticks: {
        color: '#64748b',
        callback: (val: any) => `£${(val / 1000).toFixed(0)}k`,
      },
      grid: { color: 'rgba(100, 116, 139, 0.1)' },
    },
  },
};
</script>
