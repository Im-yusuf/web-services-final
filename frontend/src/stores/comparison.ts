// Pinia store for managing the property comparison feature.
// Allows users to select up to 3 properties to compare side-by-side.
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PropertySale } from '@/types';

// Maximum number of properties that can be compared simultaneously
const MAX_COMPARISON = 3;

export const useComparisonStore = defineStore('comparison', () => {
  // List of properties currently selected for comparison
  const properties = ref<PropertySale[]>([]);

  // Computed flag indicating whether the comparison limit has been reached
  const isFull = computed(() => properties.value.length >= MAX_COMPARISON);

  // Returns the count of currently selected properties
  const count = computed(() => properties.value.length);

  /**
   * Check whether a given property is already in the comparison list.
   */
  function isSelected(propertyId: string): boolean {
    return properties.value.some((p) => p.id === propertyId);
  }

  /**
   * Toggle a property in/out of the comparison list.
   * Returns false if the list is full and the property isn't being removed.
   */
  function toggle(property: PropertySale): boolean {
    const idx = properties.value.findIndex((p) => p.id === property.id);
    if (idx >= 0) {
      properties.value.splice(idx, 1);
      return true;
    }
    if (isFull.value) return false;
    properties.value.push(property);
    return true;
  }

  /**
   * Remove a property from the comparison list by its ID.
   */
  function remove(propertyId: string) {
    properties.value = properties.value.filter((p) => p.id !== propertyId);
  }

  /**
   * Clear all properties from the comparison list.
   */
  function clear() {
    properties.value = [];
  }

  return {
    properties,
    isFull,
    count,
    isSelected,
    toggle,
    remove,
    clear,
  };
});
