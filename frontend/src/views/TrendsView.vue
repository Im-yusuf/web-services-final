<!-- Price trends page — interactive line chart with region, year, and property type filters.
     Below the chart, a growth summary section shows period start/end prices and total growth %. -->
<template>
  <div class="flex gap-6">
    <!-- Filters Sidebar -->
    <div class="w-72 flex-shrink-0">
      <PropertyFilters
        v-model="filter"
        :show-property-type="true"
        :show-year="true"
        @change="fetchTrends"
        @reset="fetchTrends"
      />
    </div>

    <!-- Main Content -->
    <div class="flex-1 space-y-6">
      <TrendChart title="Price Trends" :data="trendData" />

      <!-- Growth Summary -->
      <div class="card" v-if="trendData.length > 1">
        <h3 class="text-lg font-semibold mb-4">Growth Summary</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-dark-700 rounded-lg p-4">
            <p class="text-sm text-gray-400">Period Start</p>
            <p class="text-xl font-bold text-white">
              £{{ trendData[0].avgPrice.toLocaleString() }}
            </p>
            <p class="text-xs text-gray-500">
              {{ trendData[0].year }}-{{ String(trendData[0].month).padStart(2, '0') }}
            </p>
          </div>
          <div class="bg-dark-700 rounded-lg p-4">
            <p class="text-sm text-gray-400">Period End</p>
            <p class="text-xl font-bold text-white">
              £{{ trendData[trendData.length - 1].avgPrice.toLocaleString() }}
            </p>
            <p class="text-xs text-gray-500">
              {{ trendData[trendData.length - 1].year }}-{{ String(trendData[trendData.length - 1].month).padStart(2, '0') }}
            </p>
          </div>
          <div class="bg-dark-700 rounded-lg p-4">
            <p class="text-sm text-gray-400">Total Growth</p>
            <p
              class="text-xl font-bold"
              :class="totalGrowth >= 0 ? 'text-green-400' : 'text-red-400'"
            >
              {{ totalGrowth >= 0 ? '+' : '' }}{{ totalGrowth.toFixed(1) }}%
            </p>
            <p class="text-xs text-gray-500">
              {{ trendData.reduce((sum, d) => sum + d.transactionCount, 0).toLocaleString() }} transactions
            </p>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12 text-gray-500">
        Loading trend data...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import TrendChart from '@/components/TrendChart.vue';
import PropertyFilters from '@/components/PropertyFilters.vue';
import { propertyService } from '@/services/propertyService';
import { useDataCacheStore } from '@/stores/dataCache';
import type { TrendData, TrendFilter } from '@/types';

const cache = useDataCacheStore();

const trendData = ref<TrendData[]>([]);
const loading = ref(false);
const filter = ref<TrendFilter>({ region: '', year: '2025', propertyType: '' });

const totalGrowth = computed(() => {
  if (trendData.value.length < 2) return 0;
  const first = trendData.value[0].avgPrice;
  const last = trendData.value[trendData.value.length - 1].avgPrice;
  return first > 0 ? ((last - first) / first) * 100 : 0;
});

function hasActiveFilters(): boolean {
  return !!(filter.value.region || filter.value.propertyType);
}

async function fetchTrends() {
  loading.value = true;
  try {
    trendData.value = hasActiveFilters()
      ? await propertyService.getTrends(filter.value)
      : await cache.getDefaultTrends();
  } catch (err) {
    console.error('Failed to fetch trends:', err);
  } finally {
    loading.value = false;
  }
}

onMounted(fetchTrends);
</script>
