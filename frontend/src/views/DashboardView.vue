<!-- Dashboard overview — loads stats, trends, heatmap, and region data in parallel.
     Renders stat cards, a price trend line chart, a top-regions pie chart,
     a transaction volume bar chart, and the market insights assistant. -->
<template>
  <div class="space-y-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardCard
        title="Total Properties"
        :value="stats.totalProperties"
        icon="🏘️"
        format="number"
      />
      <DashboardCard
        title="Average Price"
        :value="stats.avgPrice"
        icon="💷"
        format="currency"
      />
      <DashboardCard
        title="Regions Tracked"
        :value="regionCount"
        icon="🗺️"
        format="number"
      />
      <DashboardCard
        title="Latest Data"
        :value="latestDate"
        icon="📅"
      />
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Price Trends -->
      <TrendChart title="Price Trends (All Regions)" :data="trendData" />

      <!-- Property Type Distribution -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">Property Type Distribution</h3>
        <div class="h-80">
          <Pie v-if="pieData" :data="pieData" :options="pieOptions" />
          <div v-else class="h-full flex items-center justify-center text-gray-500">
            Loading...
          </div>
        </div>
      </div>
    </div>

    <!-- Transaction Volume + AI -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Transaction Volume -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">Transaction Volume</h3>
        <div class="h-80">
          <Bar v-if="volumeData" :data="volumeData" :options="volumeOptions" />
          <div v-else class="h-full flex items-center justify-center text-gray-500">
            Loading...
          </div>
        </div>
      </div>

      <!-- AI Assistant -->
      <MarketAssistant />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Pie, Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import DashboardCard from '@/components/DashboardCard.vue';
import TrendChart from '@/components/TrendChart.vue';
import MarketAssistant from '@/components/MarketAssistant.vue';
import { useDataCacheStore } from '@/stores/dataCache';
import type { TrendData, HeatmapData, MarketStats } from '@/types';

const cache = useDataCacheStore();

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const stats = ref<MarketStats>({ totalProperties: 0, avgPrice: 0, latestSaleDate: null });
const trendData = ref<TrendData[]>([]);
const heatmapData = ref<HeatmapData[]>([]);
const regionCount = ref(0);

const latestDate = computed(() => {
  if (!stats.value.latestSaleDate) return 'N/A';
  return new Date(stats.value.latestSaleDate).toLocaleDateString('en-GB');
});

// Pie chart for property types from heatmap data won't work — let's use trend data
const pieData = computed(() => {
  // We'll derive from heatmap top regions
  if (!heatmapData.value.length) return null;
  const top5 = heatmapData.value.slice(0, 5);
  return {
    labels: top5.map((d) => d.region),
    datasets: [
      {
        data: top5.map((d) => d.totalSales),
        backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
      },
    ],
  };
});

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: '#94a3b8', padding: 16 },
    },
  },
};

const volumeData = computed(() => {
  if (!trendData.value.length) return null;
  const labels = trendData.value.map((d) => `${d.year}-${String(d.month).padStart(2, '0')}`);
  return {
    labels,
    datasets: [
      {
        label: 'Transactions',
        data: trendData.value.map((d) => d.transactionCount),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: '#3b82f6',
        borderWidth: 1,
      },
    ],
  };
});

const volumeOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#94a3b8' } },
  },
  scales: {
    x: {
      ticks: { color: '#64748b', maxTicksLimit: 12 },
      grid: { color: 'rgba(100, 116, 139, 0.1)' },
    },
    y: {
      ticks: { color: '#64748b' },
      grid: { color: 'rgba(100, 116, 139, 0.1)' },
    },
  },
};

onMounted(async () => {
  try {
    const [s, t, h, r] = await Promise.all([
      cache.getStats(),
      cache.getDefaultTrends(),
      cache.getHeatmap(),
      cache.getRegions(),
    ]);
    stats.value = s;
    trendData.value = t;
    heatmapData.value = h;
    regionCount.value = r.length;
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
  }
});
</script>
