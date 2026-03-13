// Pinia saved-listings store — fetches, saves, and removes the
// current user’s bookmarked properties via the property service.
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { propertyService } from '@/services/propertyService';
import type { SavedListing } from '@/types';

export const useSavedStore = defineStore('saved', () => {
  const listings = ref<SavedListing[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchListings() {
    loading.value = true;
    error.value = null;
    try {
      listings.value = await propertyService.getSavedListings();
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch saved listings';
    } finally {
      loading.value = false;
    }
  }

  async function saveListing(propertyId: string, notes?: string) {
    try {
      await propertyService.saveListing(propertyId, notes);
      await fetchListings();
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to save listing';
      throw err;
    }
  }

  async function removeListing(id: string) {
    try {
      await propertyService.deleteSavedListing(id);
      listings.value = listings.value.filter((l) => l.id !== id);
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to remove listing';
      throw err;
    }
  }

  async function updateNotes(id: string, notes: string | null) {
    try {
      const updated = await propertyService.updateSavedListing(id, notes);
      const idx = listings.value.findIndex((l) => l.id === id);
      if (idx >= 0) listings.value[idx] = updated;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to update notes';
      throw err;
    }
  }

  return {
    listings,
    loading,
    error,
    fetchListings,
    saveListing,
    removeListing,
    updateNotes,
  };
});
