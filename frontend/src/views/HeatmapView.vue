<!-- Heatmap view — displays a horizontal bar chart of average prices by county
     and a sortable table showing region, avg price, total sales, and a price-index badge. -->
<template>
  <div class="space-y-6">
    <HeatmapChart title="Average House Price by Region" :data="heatmapData" />

    <!-- Region Details Table -->
    <div class="card">
      <h3 class="text-lg font-semibold mb-4">Regional Breakdown</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-dark-600">
              <th class="text-left py-3 px-4 text-gray-400 font-medium">Region</th>
              <th class="text-right py-3 px-4 text-gray-400 font-medium">Avg Price</th>
              <th class="text-right py-3 px-4 text-gray-400 font-medium">Total Sales</th>
              <th class="text-right py-3 px-4 text-gray-400 font-medium">Price Index</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="region in heatmapData"
              :key="region.region"
              class="border-b border-dark-700 hover:bg-dark-700/50 transition-colors"
            >
              <td class="py-3 px-4 text-gray-200">{{ region.region }}</td>
              <td class="py-3 px-4 text-right text-white font-medium">
                £{{ region.avgPrice.toLocaleString() }}
              </td>
              <td class="py-3 px-4 text-right text-gray-300">
                {{ region.totalSales.toLocaleString() }}
              </td>
              <td class="py-3 px-4 text-right">
                <span
                  class="inline-block px-2 py-1 rounded text-xs font-medium"
                  :class="getPriceIndexClass(region.avgPrice)"
                >
                  {{ getPriceIndex(region.avgPrice) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="loading" class="text-center py-8 text-gray-500">
        Loading heatmap data...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import HeatmapChart from '@/components/HeatmapChart.vue';
import { useDataCacheStore } from '@/stores/dataCache';
import type { HeatmapData } from '@/types';

const cache = useDataCacheStore();

const heatmapData = ref<HeatmapData[]>([]);
const loading = ref(false);

function getPriceIndex(price: number): string {
  if (price >= 500000) return 'Premium';
  if (price >= 300000) return 'High';
  if (price >= 200000) return 'Medium';
  if (price >= 100000) return 'Affordable';
  return 'Low';
}

function getPriceIndexClass(price: number): string {
  if (price >= 500000) return 'bg-red-900/30 text-red-400';
  if (price >= 300000) return 'bg-orange-900/30 text-orange-400';
  if (price >= 200000) return 'bg-yellow-900/30 text-yellow-400';
  if (price >= 100000) return 'bg-green-900/30 text-green-400';
  return 'bg-blue-900/30 text-blue-400';
}

onMounted(async () => {
  loading.value = true;
  try {
    heatmapData.value = await cache.getHeatmap();
  } catch (err) {
    console.error('Failed to fetch heatmap:', err);
  } finally {
    loading.value = false;
  }
});
</script>
