// Pinia data cache store — caches expensive API responses (stats, trends,
// heatmap, regions) so they are fetched once and reused across views.
// Each cache entry has a TTL (default 5 minutes) after which it is refreshed.
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { propertyService } from '@/services/propertyService';
import type { TrendData, HeatmapData, MarketStats } from '@/types';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in ms

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

function isValid<T>(entry: CacheEntry<T> | null): entry is CacheEntry<T> {
  return entry !== null && Date.now() - entry.fetchedAt < CACHE_TTL;
}

export const useDataCacheStore = defineStore('dataCache', () => {
  const stats = ref<CacheEntry<MarketStats> | null>(null);
  const defaultTrends = ref<CacheEntry<TrendData[]> | null>(null);
  const heatmap = ref<CacheEntry<HeatmapData[]> | null>(null);
  const regions = ref<CacheEntry<string[]> | null>(null);

  async function getStats(): Promise<MarketStats> {
    if (isValid(stats.value)) return stats.value.data;
    const data = await propertyService.getStats();
    stats.value = { data, fetchedAt: Date.now() };
    return data;
  }

  async function getDefaultTrends(): Promise<TrendData[]> {
    if (isValid(defaultTrends.value)) return defaultTrends.value.data;
    const data = await propertyService.getTrends();
    defaultTrends.value = { data, fetchedAt: Date.now() };
    return data;
  }

  async function getHeatmap(): Promise<HeatmapData[]> {
    if (isValid(heatmap.value)) return heatmap.value.data;
    const data = await propertyService.getHeatmap();
    heatmap.value = { data, fetchedAt: Date.now() };
    return data;
  }

  async function getRegions(): Promise<string[]> {
    if (isValid(regions.value)) return regions.value.data;
    const data = await propertyService.getRegions();
    regions.value = { data, fetchedAt: Date.now() };
    return data;
  }

  function invalidate() {
    stats.value = null;
    defaultTrends.value = null;
    heatmap.value = null;
    regions.value = null;
  }

  return { getStats, getDefaultTrends, getHeatmap, getRegions, invalidate };
});
