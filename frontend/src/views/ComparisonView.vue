<template>
  <div class="space-y-6">
    <!-- Header with clear button -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Compare Properties</h2>
      <button v-if="comparisonStore.count > 0" @click="comparisonStore.clear()" class="btn-secondary text-sm">
        Clear All
      </button>
    </div>

    <!-- Empty state when no properties are selected -->
    <div v-if="comparisonStore.count === 0" class="card text-center py-16">
      <p class="text-4xl mb-4">⚖️</p>
      <p class="text-gray-400 text-lg mb-2">No properties selected for comparison</p>
      <p class="text-gray-500 text-sm">
        Go to <router-link to="/properties" class="text-primary-400 hover:text-primary-300">Properties</router-link>
        or <router-link to="/saved" class="text-primary-400 hover:text-primary-300">Saved Listings</router-link>
        and click the compare button on up to 3 properties.
      </p>
    </div>

    <!-- Comparison table when properties are selected -->
    <div v-else class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-dark-600">
            <th class="text-left py-3 px-4 text-gray-400 font-medium w-40">Attribute</th>
            <th
              v-for="prop in comparisonStore.properties"
              :key="prop.id"
              class="text-left py-3 px-4 text-gray-400 font-medium min-w-[200px]"
            >
              <div class="flex items-center justify-between">
                <span class="truncate">{{ prop.street || 'Unknown' }}</span>
                <button
                  @click="comparisonStore.remove(prop.id)"
                  class="text-gray-500 hover:text-red-400 transition-colors ml-2 shrink-0"
                  title="Remove from comparison"
                >
                  ✕
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Price row — highlights the lowest price in green -->
          <tr class="border-b border-dark-700 hover:bg-dark-700/50">
            <td class="py-3 px-4 text-gray-400 font-medium">Price</td>
            <td
              v-for="prop in comparisonStore.properties"
              :key="'price-' + prop.id"
              class="py-3 px-4 text-white font-semibold"
              :class="{ 'text-green-400': isLowestPrice(prop.price) }"
            >
              £{{ prop.price.toLocaleString() }}
            </td>
          </tr>

          <!-- Standard comparison rows driven by the rows config array -->
          <tr
            v-for="row in comparisonRows"
            :key="row.label"
            class="border-b border-dark-700 hover:bg-dark-700/50"
          >
            <td class="py-3 px-4 text-gray-400 font-medium">{{ row.label }}</td>
            <td
              v-for="prop in comparisonStore.properties"
              :key="row.label + '-' + prop.id"
              class="py-3 px-4 text-gray-200"
            >
              {{ row.getValue(prop) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Insight cards summarising the comparison -->
    <div v-if="comparisonStore.count >= 2" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="card">
        <p class="text-xs text-gray-500 mb-1">Price Range</p>
        <p class="text-lg font-bold text-white">
          £{{ priceRange.min.toLocaleString() }} – £{{ priceRange.max.toLocaleString() }}
        </p>
        <p class="text-xs text-gray-500 mt-1">
          Difference: £{{ (priceRange.max - priceRange.min).toLocaleString() }}
        </p>
      </div>
      <div class="card">
        <p class="text-xs text-gray-500 mb-1">Best Value</p>
        <p class="text-lg font-bold text-green-400 truncate">
          {{ cheapest?.street || 'N/A' }}
        </p>
        <p class="text-xs text-gray-500 mt-1">
          {{ cheapest?.townCity }}, {{ cheapest?.county }}
        </p>
      </div>
      <div class="card">
        <p class="text-xs text-gray-500 mb-1">Regions Compared</p>
        <p class="text-lg font-bold text-white">
          {{ uniqueRegions.join(', ') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useComparisonStore } from '@/stores/comparison';
import { PROPERTY_TYPES } from '@/types';
import type { PropertySale } from '@/types';

const comparisonStore = useComparisonStore();

// Configuration for each row in the comparison table
const comparisonRows = [
  { label: 'Property Type', getValue: (p: PropertySale) => PROPERTY_TYPES[p.propertyType] || p.propertyType },
  { label: 'Town / City', getValue: (p: PropertySale) => p.townCity },
  { label: 'District', getValue: (p: PropertySale) => p.district },
  { label: 'County', getValue: (p: PropertySale) => p.county },
  { label: 'Postcode', getValue: (p: PropertySale) => p.postcode },
  { label: 'Tenure', getValue: (p: PropertySale) => p.tenure },
  { label: 'New Build', getValue: (p: PropertySale) => (p.newBuild ? 'Yes' : 'No') },
  { label: 'Sale Date', getValue: (p: PropertySale) => new Date(p.transferDate).toLocaleDateString('en-GB') },
];

// Determine whether a given price is the lowest among all compared properties
function isLowestPrice(price: number): boolean {
  if (comparisonStore.count < 2) return false;
  return price === Math.min(...comparisonStore.properties.map((p) => p.price));
}

// Price range across all compared properties
const priceRange = computed(() => {
  const prices = comparisonStore.properties.map((p) => p.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
});

// The property with the lowest price
const cheapest = computed(() => {
  if (comparisonStore.count === 0) return null;
  return comparisonStore.properties.reduce((a, b) => (a.price <= b.price ? a : b));
});

// Deduplicated list of counties being compared
const uniqueRegions = computed(() => {
  return [...new Set(comparisonStore.properties.map((p) => p.county))];
});
</script>
