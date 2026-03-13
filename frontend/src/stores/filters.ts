// Pinia filter store — holds the current filter values for both the
// property listing page and the trends page, with reset helpers.
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { PropertyFilter, TrendFilter } from '@/types';

export const useFilterStore = defineStore('filters', () => {
  const propertyFilter = ref<PropertyFilter>({
    region: '',
    minPrice: undefined,
    maxPrice: undefined,
    propertyType: '',
    page: 1,
    limit: 20,
  });

  const trendFilter = ref<TrendFilter>({
    region: '',
    year: '2025',
    propertyType: '',
  });

  function updatePropertyFilter(updates: Partial<PropertyFilter>) {
    propertyFilter.value = { ...propertyFilter.value, ...updates };
  }

  function updateTrendFilter(updates: Partial<TrendFilter>) {
    trendFilter.value = { ...trendFilter.value, ...updates };
  }

  function resetPropertyFilter() {
    propertyFilter.value = { region: '', minPrice: undefined, maxPrice: undefined, propertyType: '', page: 1, limit: 20 };
  }

  function resetTrendFilter() {
    trendFilter.value = { region: '', year: '2025', propertyType: '' };
  }

  return {
    propertyFilter,
    trendFilter,
    updatePropertyFilter,
    updateTrendFilter,
    resetPropertyFilter,
    resetTrendFilter,
  };
});
