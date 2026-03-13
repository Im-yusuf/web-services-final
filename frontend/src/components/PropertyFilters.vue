<!-- Reusable filter panel used on the Properties and Trends pages.
     Conditionally renders region, property type, year, and price range inputs
     based on boolean props. Emits change/reset events and fetches regions on mount. -->
<template>
  <div class="card">
    <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Filters</h3>

    <div class="space-y-4">
      <!-- Region -->
      <div>
        <label class="block text-sm text-gray-400 mb-1">Region</label>
        <select v-model="localFilter.region" class="select-field" @change="emitChange">
          <option value="">All Regions</option>
          <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>

      <!-- Property Type -->
      <div v-if="showPropertyType">
        <label class="block text-sm text-gray-400 mb-1">Property Type</label>
        <select v-model="localFilter.propertyType" class="select-field" @change="emitChange">
          <option value="">All Types</option>
          <option v-for="(label, code) in PROPERTY_TYPES" :key="code" :value="code">
            {{ label }}
          </option>
        </select>
      </div>

      <!-- Year (for trends) -->
      <div v-if="showYear">
        <label class="block text-sm text-gray-400 mb-1">Year</label>
        <select v-model="localFilter.year" class="select-field" @change="emitChange">
          <option value="">All Years</option>
          <option v-for="y in years" :key="y" :value="String(y)">{{ y }}</option>
        </select>
      </div>

      <!-- Price Range -->
      <div v-if="showPriceRange">
        <label class="block text-sm text-gray-400 mb-1">Min Price (£)</label>
        <input
          v-model.number="localFilter.minPrice"
          type="number"
          class="input-field"
          placeholder="0"
          @change="emitChange"
        />
      </div>

      <div v-if="showPriceRange">
        <label class="block text-sm text-gray-400 mb-1">Max Price (£)</label>
        <input
          v-model.number="localFilter.maxPrice"
          type="number"
          class="input-field"
          placeholder="No limit"
          @change="emitChange"
        />
      </div>

      <!-- Reset -->
      <button @click="handleReset" class="btn-secondary w-full text-sm">
        Reset Filters
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { propertyService } from '@/services/propertyService';
import { PROPERTY_TYPES } from '@/types';

const props = withDefaults(
  defineProps<{
    modelValue: Record<string, any>;
    showPropertyType?: boolean;
    showYear?: boolean;
    showPriceRange?: boolean;
  }>(),
  {
    showPropertyType: true,
    showYear: false,
    showPriceRange: false,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, any>): void;
  (e: 'change', value: Record<string, any>): void;
  (e: 'reset'): void;
}>();

const regions = ref<string[]>([]);
const localFilter = ref({ ...props.modelValue });

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

watch(
  () => props.modelValue,
  (val) => {
    localFilter.value = { ...val };
  },
  { deep: true }
);

function emitChange() {
  emit('update:modelValue', { ...localFilter.value });
  emit('change', { ...localFilter.value });
}

function handleReset() {
  localFilter.value = {
    region: '',
    propertyType: '',
    year: '',
    minPrice: undefined,
    maxPrice: undefined,
  };
  emitChange();
  emit('reset');
}

onMounted(async () => {
  try {
    regions.value = await propertyService.getRegions();
  } catch {
    regions.value = [];
  }
});
</script>
