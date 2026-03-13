<!-- Saved listings page — shows the user's bookmarked properties in a card grid.
     Each card includes a remove button and a compare button for the comparison tool. -->
<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Your Saved Properties</h2>
      <span class="text-sm text-gray-400">{{ savedStore.listings.length }} saved</span>
    </div>

    <div v-if="savedStore.loading" class="text-center py-12 text-gray-500">
      Loading saved listings...
    </div>

    <div v-else-if="savedStore.listings.length === 0" class="card text-center py-12">
      <p class="text-gray-400 text-lg mb-2">No saved properties yet</p>
      <p class="text-gray-500 text-sm">
        Browse properties from the dashboard and save the ones you're interested in.
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="listing in savedStore.listings"
        :key="listing.id"
        class="card hover:border-primary-500/30 transition-colors"
      >
        <div class="flex justify-between items-start mb-3">
          <span
            class="inline-block px-2 py-1 rounded text-xs font-medium bg-primary-600/20 text-primary-400"
          >
            {{ getPropertyTypeLabel(listing.property.propertyType) }}
          </span>
          <button
            @click="handleRemove(listing.id)"
            class="text-gray-500 hover:text-red-400 transition-colors text-sm"
            title="Remove from saved"
          >
            ✕
          </button>
        </div>

        <p class="text-xl font-bold text-white mb-1">
          £{{ listing.property.price.toLocaleString() }}
        </p>

        <p class="text-sm text-gray-300">
          {{ listing.property.street || 'Address unavailable' }}
        </p>
        <p class="text-sm text-gray-400">
          {{ listing.property.townCity }}, {{ listing.property.county }}
        </p>
        <p class="text-sm text-gray-500">{{ listing.property.postcode }}</p>

        <div class="flex items-center gap-3 mt-3 pt-3 border-t border-dark-600 text-xs text-gray-500">
          <span>{{ listing.property.tenure }}</span>
          <span>•</span>
          <span>{{ listing.property.newBuild ? 'New Build' : 'Existing' }}</span>
          <span>•</span>
          <span>{{ new Date(listing.property.transferDate).toLocaleDateString('en-GB') }}</span>
        </div>

        <div v-if="listing.notes && editingId !== listing.id" class="mt-3 flex items-start gap-2 bg-dark-700 p-2 rounded">
          <p class="flex-1 text-sm text-gray-400 italic cursor-pointer" @click="startEdit(listing)" title="Click to edit note">
            "{{ listing.notes }}"
          </p>
          <button
            @click="deleteNote(listing.id)"
            class="text-gray-600 hover:text-red-400 transition-colors text-xs shrink-0 mt-0.5"
            title="Delete note"
          >
            🗑
          </button>
        </div>

        <!-- Inline notes editor -->
        <div v-if="editingId === listing.id" class="mt-3 space-y-2">
          <textarea
            v-model="editText"
            class="input-field w-full text-sm"
            rows="2"
            placeholder="Add a note..."
            maxlength="500"
          />
          <div class="flex gap-2">
            <button @click="saveEdit(listing.id)" class="btn-primary text-xs px-3 py-1">Save</button>
            <button @click="cancelEdit" class="btn-secondary text-xs px-3 py-1">Cancel</button>
          </div>
        </div>

        <button
          v-if="editingId !== listing.id && !listing.notes"
          @click="startEdit(listing)"
          class="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          + Add note
        </button>
        <button
          v-if="editingId !== listing.id && listing.notes"
          @click="startEdit(listing)"
          class="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          ✏️ Edit note
        </button>

        <!-- Compare button for saved listings -->
        <button
          @click="comparisonStore.toggle(listing.property)"
          class="mt-2 w-full text-xs py-1.5 rounded-lg transition-colors"
          :class="comparisonStore.isSelected(listing.property.id)
            ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
            : 'bg-dark-700 text-gray-400 hover:text-white border border-dark-600'"
          :disabled="!comparisonStore.isSelected(listing.property.id) && comparisonStore.isFull"
        >
          {{ comparisonStore.isSelected(listing.property.id) ? '✓ Comparing' : '⚖️ Compare' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSavedStore } from '@/stores/saved';
import { useComparisonStore } from '@/stores/comparison';
import { PROPERTY_TYPES, getPropertyTypeLabel } from '@/types';

const savedStore = useSavedStore();
const comparisonStore = useComparisonStore();

const editingId = ref<string | null>(null);
const editText = ref('');

function startEdit(listing: any) {
  editingId.value = listing.id;
  editText.value = listing.notes || '';
}

function cancelEdit() {
  editingId.value = null;
  editText.value = '';
}

async function saveEdit(id: string) {
  try {
    await savedStore.updateNotes(id, editText.value || null);
    editingId.value = null;
    editText.value = '';
  } catch {
    // Error handled in store
  }
}

async function deleteNote(id: string) {
  try {
    await savedStore.updateNotes(id, null);
  } catch {
    // Error handled in store
  }
}

async function handleRemove(id: string) {
  try {
    await savedStore.removeListing(id);
  } catch {
    // Error handled in store
  }
}

onMounted(() => {
  savedStore.fetchListings();
});
</script>
