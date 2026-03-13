<!-- Interactive market insights panel. The user types a UK region name,
     and the component fetches computed analytics (growth, affordability,
     property type breakdown, tenure stats) from the insights API. -->
<template>
  <div class="card">
    <h3 class="text-lg font-semibold mb-4">📊 Regional Market Insights</h3>

    <div class="space-y-4">
      <div class="flex gap-2">
        <input
          v-model="regionInput"
          class="input-field flex-1"
          placeholder="Enter a region (e.g., Leeds, Manchester)"
          @keyup.enter="fetchInsights"
        />
        <button
          @click="fetchInsights"
          class="btn-primary whitespace-nowrap"
          :disabled="loading || !regionInput.trim()"
        >
          {{ loading ? 'Loading...' : 'Analyse' }}
        </button>
      </div>

      <div v-if="error" class="text-red-400 text-sm">{{ error }}</div>

      <div v-if="insights" class="space-y-4">
        <!-- Market Signal Badge -->
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-400">Market Signal</span>
          <span :class="signalClass" class="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
            {{ signalLabel }}
          </span>
        </div>

        <!-- Key Metrics Grid -->
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-dark-700 rounded-lg p-3">
            <p class="text-xs text-gray-500 mb-1">Avg Price</p>
            <p class="text-base font-semibold text-white">{{ formatCurrency(insights.avgPrice) }}</p>
          </div>
          <div class="bg-dark-700 rounded-lg p-3">
            <p class="text-xs text-gray-500 mb-1">Median Price</p>
            <p class="text-base font-semibold text-white">{{ formatCurrency(insights.medianPrice) }}</p>
          </div>
          <div class="bg-dark-700 rounded-lg p-3">
            <p class="text-xs text-gray-500 mb-1">1-Year Growth</p>
            <p class="text-base font-semibold" :class="insights.oneYearGrowthPct != null && insights.oneYearGrowthPct >= 0 ? 'text-green-400' : 'text-red-400'">
              {{ insights.oneYearGrowthPct != null ? formatPct(insights.oneYearGrowthPct) : 'N/A' }}
            </p>
          </div>
          <div class="bg-dark-700 rounded-lg p-3">
            <p class="text-xs text-gray-500 mb-1">5-Year Growth</p>
            <p class="text-base font-semibold" :class="insights.fiveYearGrowthPct != null && insights.fiveYearGrowthPct >= 0 ? 'text-green-400' : 'text-red-400'">
              {{ insights.fiveYearGrowthPct != null ? formatPct(insights.fiveYearGrowthPct) : 'N/A' }}
            </p>
          </div>
          <div class="bg-dark-700 rounded-lg p-3">
            <p class="text-xs text-gray-500 mb-1">Affordability Ratio</p>
            <p class="text-base font-semibold text-white">{{ insights.affordabilityRatio.toFixed(1) }}x</p>
          </div>
          <div class="bg-dark-700 rounded-lg p-3">
            <p class="text-xs text-gray-500 mb-1">Transactions</p>
            <p class="text-base font-semibold text-white">{{ insights.totalTransactions.toLocaleString() }}</p>
          </div>
        </div>

        <!-- Property Type Breakdown -->
        <div>
          <p class="text-xs text-gray-500 mb-2">Property Type Breakdown</p>
          <div class="space-y-1">
            <div v-for="pt in insights.propertyTypeBreakdown" :key="pt.propertyType" class="flex items-center gap-2 text-xs">
              <span class="text-gray-400 w-28 shrink-0">{{ pt.label }}</span>
              <div class="flex-1 bg-dark-700 rounded-full h-2">
                <div class="bg-primary-500 h-2 rounded-full" :style="{ width: pt.share + '%' }"></div>
              </div>
              <span class="text-gray-300 w-10 text-right">{{ pt.share.toFixed(0) }}%</span>
              <span class="text-gray-500 w-24 text-right">{{ formatCurrency(pt.avgPrice) }}</span>
            </div>
          </div>
        </div>

        <!-- Tenure / New Build -->
        <div class="flex gap-4 text-xs text-gray-400">
          <span>Freehold: <span class="text-white font-medium">{{ insights.freeholdShare.toFixed(0) }}%</span></span>
          <span>New Build: <span class="text-white font-medium">{{ insights.newBuildShare.toFixed(0) }}%</span></span>
        </div>
      </div>

      <div v-else-if="!loading" class="text-center py-8 text-gray-500 text-sm">
        Enter a UK region to view data-driven market insights.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { propertyService } from '@/services/propertyService';
import type { MarketInsights, MarketSignal } from '@/types';

const regionInput = ref('');
const loading = ref(false);
const error = ref('');
const insights = ref<MarketInsights | null>(null);

async function fetchInsights() {
  const region = regionInput.value.trim();
  if (!region) return;
  loading.value = true;
  error.value = '';
  insights.value = null;
  try {
    insights.value = await propertyService.getRegionInsights(region.toUpperCase());
  } catch {
    error.value = 'Unable to load insights for this region. Please try again.';
  } finally {
    loading.value = false;
  }
}

const signalLabels: Record<MarketSignal, string> = {
  'strong-growth': 'Strong Growth',
  'moderate-growth': 'Moderate Growth',
  'stable': 'Stable',
  'declining': 'Declining',
  'insufficient-data': 'Insufficient Data',
};

const signalColors: Record<MarketSignal, string> = {
  'strong-growth': 'bg-green-600/30 text-green-300',
  'moderate-growth': 'bg-blue-600/30 text-blue-300',
  'stable': 'bg-gray-600/30 text-gray-300',
  'declining': 'bg-red-600/30 text-red-300',
  'insufficient-data': 'bg-yellow-600/30 text-yellow-300',
};

const signalLabel = computed(() => insights.value ? signalLabels[insights.value.marketSignal] : '');
const signalClass = computed(() => insights.value ? signalColors[insights.value.marketSignal] : '');

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value);
}

function formatPct(value: number): string {
  return (value >= 0 ? '+' : '') + value.toFixed(1) + '%';
}
</script>
