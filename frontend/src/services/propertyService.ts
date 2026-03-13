// Frontend property service — wraps all property, saved-listing, and insights API calls.
// Also includes saved listing methods used by the saved store.
import api from './api';
import type {
  ApiResponse,
  TrendData,
  HeatmapData,
  PropertySale,
  PaginatedResponse,
  PropertyFilter,
  TrendFilter,
  MarketStats,
  MarketInsights,
} from '@/types';

export const propertyService = {
  async getTrends(filter: TrendFilter = {}): Promise<TrendData[]> {
    const params = new URLSearchParams();
    if (filter.region) params.set('region', filter.region);
    params.set('year', '2025');
    if (filter.propertyType) params.set('propertyType', filter.propertyType);

    const { data } = await api.get<ApiResponse<TrendData[]>>(`/trends?${params}`);
    return data.data || [];
  },

  async getHeatmap(): Promise<HeatmapData[]> {
    const { data } = await api.get<ApiResponse<HeatmapData[]>>('/heatmap');
    return data.data || [];
  },

  async getProperties(filter: PropertyFilter = {}): Promise<PaginatedResponse<PropertySale>> {
    const params = new URLSearchParams();
    if (filter.region) params.set('region', filter.region);
    if (filter.minPrice) params.set('minPrice', String(filter.minPrice));
    if (filter.maxPrice) params.set('maxPrice', String(filter.maxPrice));
    if (filter.propertyType) params.set('propertyType', filter.propertyType);
    if (filter.page) params.set('page', String(filter.page));
    if (filter.limit) params.set('limit', String(filter.limit));

    const { data } = await api.get<ApiResponse<PaginatedResponse<PropertySale>>>(`/properties?${params}`);
    return data.data || { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  },

  async getRegions(): Promise<string[]> {
    const { data } = await api.get<ApiResponse<string[]>>('/regions');
    return data.data || [];
  },

  async getStats(): Promise<MarketStats> {
    const { data } = await api.get<ApiResponse<MarketStats>>('/stats');
    return data.data || { totalProperties: 0, avgPrice: 0, latestSaleDate: null };
  },

  async getRegionInsights(region: string): Promise<MarketInsights | null> {
    const { data } = await api.post<ApiResponse<MarketInsights>>('/insights/region', { region });
    return data.data || null;
  },

  async saveListing(propertyId: string, notes?: string) {
    const { data } = await api.post('/saved', { propertyId, notes });
    return data.data;
  },

  async getSavedListings() {
    const { data } = await api.get('/saved');
    return data.data || [];
  },

  async deleteSavedListing(id: string) {
    await api.delete(`/saved/${id}`);
  },

  async updateSavedListing(id: string, notes: string | null) {
    const { data } = await api.put(`/saved/${id}`, { notes });
    return data.data;
  },
};
