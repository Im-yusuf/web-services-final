<!-- Property browser — paginated grid of property cards with filters sidebar.
     Each card shows save (bookmark) and compare buttons.
     Pagination controls at the bottom navigate through results. -->
<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Browse Properties</h2>
      <span class="text-sm text-gray-400">
        {{ pagination.total.toLocaleString() }} properties found
      </span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Filters Sidebar -->
      <div class="lg:col-span-1">
        <PropertyFilters
          v-model="filter"
          :show-property-type="true"
          :show-year="false"
          :show-price-range="true"
          @update:model-value="handleFilterChange"
        />
      </div>

      <!-- Property Listings -->
      <div class="lg:col-span-3 space-y-4">
        <!-- Loading state -->
        <div v-if="loading" class="text-center py-16 text-gray-500">Loading properties...</div>

        <!-- Empty state -->
        <div v-else-if="properties.length === 0" class="card text-center py-16">
          <p class="text-gray-400 text-lg">No properties found</p>
          <p class="text-gray-500 text-sm mt-1">Try adjusting the filters.</p>
        </div>

        <!-- Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div
            v-for="property in properties"
            :key="property.id"
            class="card hover:border-primary-500/30 transition-colors flex flex-col"
          >
            <!-- Type badge + save button -->
            <div class="flex justify-between items-start mb-3">
              <span class="inline-block px-2 py-1 rounded text-xs font-medium bg-primary-600/20 text-primary-400">
                {{ getPropertyTypeLabel(property.propertyType) }}
              </span>
              <button
                @click="toggleSave(property)"
                :title="isSaved(property.id) ? 'Remove from saved' : 'Save property'"
                class="transition-colors text-lg leading-none"
                :class="isSaved(property.id) ? 'text-yellow-400 hover:text-gray-400' : 'text-gray-600 hover:text-yellow-400'"
              >
                {{ isSaved(property.id) ? '★' : '☆' }}
              </button>
            </div>

            <!-- Price -->
            <p class="text-xl font-bold text-white mb-1">
              £{{ property.price.toLocaleString() }}
            </p>

            <!-- Address -->
            <p class="text-sm text-gray-300 truncate">
              {{ property.street || 'Address unavailable' }}
            </p>
            <p class="text-sm text-gray-400">
              {{ property.townCity }}, {{ property.county }}
            </p>
            <p class="text-xs text-gray-500 mt-0.5">{{ property.postcode }}</p>

            <!-- Meta row -->
            <div class="flex items-center gap-2 mt-auto pt-3 border-t border-dark-600 text-xs text-gray-500 flex-wrap">
              <span>{{ property.tenure }}</span>
              <span>•</span>
              <span>{{ property.newBuild ? 'New Build' : 'Existing' }}</span>
              <span>•</span>
              <span>{{ new Date(property.transferDate).toLocaleDateString('en-GB') }}</span>
            </div>

            <!-- Compare button -->
            <button
              @click="comparisonStore.toggle(property)"
              class="mt-2 w-full text-xs py-1.5 rounded-lg transition-colors"
              :class="comparisonStore.isSelected(property.id)
                ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                : 'bg-dark-700 text-gray-400 hover:text-white border border-dark-600'"
              :disabled="!comparisonStore.isSelected(property.id) && comparisonStore.isFull"
            >
              {{ comparisonStore.isSelected(property.id) ? '✓ Comparing' : '⚖️ Compare' }}
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="flex items-center justify-center gap-2 pt-2">
          <button
            @click="goToPage(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <span class="text-sm text-gray-400">
            Page {{ pagination.page }} of {{ pagination.totalPages }}
          </span>
          <button
            @click="goToPage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.totalPages"
            class="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { propertyService } from '@/services/propertyService';
import { useSavedStore } from '@/stores/saved';
import { useComparisonStore } from '@/stores/comparison';
import PropertyFilters from '@/components/PropertyFilters.vue';
import { PROPERTY_TYPES, getPropertyTypeLabel } from '@/types';
import type { PropertySale, PropertyFilter } from '@/types';

const savedStore = useSavedStore();
const comparisonStore = useComparisonStore();

const properties = ref<PropertySale[]>([]);
const loading = ref(false);
const filter = reactive<PropertyFilter>({});
const pagination = reactive({
  page: 1,
  total: 0,
  totalPages: 1,
  limit: 21,
});

// getPropertyTypeLabel is imported from @/types to avoid duplication

function isSaved(propertyId: string): boolean {
  return savedStore.listings.some((l) => l.propertyId === propertyId);
}

async function toggleSave(property: PropertySale) {
  if (isSaved(property.id)) {
    const listing = savedStore.listings.find((l) => l.propertyId === property.id);
    if (listing) await savedStore.removeListing(listing.id);
  } else {
    await savedStore.saveListing(property.id);
  }
}

async function fetchProperties() {
  loading.value = true;
  try {
    const result = await propertyService.getProperties({
      ...filter,
      page: pagination.page,
      limit: pagination.limit,
    });
    properties.value = result.items;
    pagination.total = result.total;
    pagination.totalPages = result.totalPages;
  } catch {
    properties.value = [];
  } finally {
    loading.value = false;
  }
}

function handleFilterChange() {
  pagination.page = 1;
  fetchProperties();
}

function goToPage(page: number) {
  pagination.page = page;
  fetchProperties();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => {
  savedStore.fetchListings();
  fetchProperties();
});
</script>
