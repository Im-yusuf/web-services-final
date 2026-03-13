// Frontend TypeScript interfaces — mirrors the API response shapes
// for type-safe consumption in components and services.

// Authenticated user object returned after login/register
export interface User {
  id: string;
  email: string;
  createdAt: string;
}

// Payload returned by auth endpoints (user + session token)
export interface AuthResponse {
  user: User;
  token: string;
}

// Individual property sale record from the Land Registry dataset
export interface PropertySale {
  id: string;
  transactionId: string;
  price: number;
  transferDate: string;
  postcode: string;
  propertyType: string;
  newBuild: boolean;
  tenure: string;
  street: string;
  townCity: string;
  district: string;
  county: string;
}

// Monthly trend data point used by TrendChart
export interface TrendData {
  year: number;
  month: number;
  avgPrice: number;
  transactionCount: number;
  priceGrowth: number;
}

// Heatmap entry — one per county, used by HeatmapChart
export interface HeatmapData {
  region: string;
  avgPrice: number;
  totalSales: number;
}

// A user’s bookmarked property with the full property object included
export interface SavedListing {
  id: string;
  userId: string;
  propertyId: string;
  notes: string | null;
  createdAt: string;
  property: PropertySale;
}

// Dashboard-level statistics for the overview cards
export interface MarketStats {
  totalProperties: number;
  avgPrice: number;
  latestSaleDate: string | null;
}

// Paginated response wrapper for the property listings endpoint
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Generic API response wrapper matching the backend envelope
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Filter state for the property listing page
export interface PropertyFilter {
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  page?: number;
  limit?: number;
}

// Filter state for the trends page
export interface TrendFilter {
  region?: string;
  year?: string;
  propertyType?: string;
}

// Mapping of single-letter property type codes to human-readable labels.
// Used across multiple components to avoid duplicating the lookup.
export const PROPERTY_TYPES: Record<string, string> = {
  D: 'Detached',
  S: 'Semi-Detached',
  T: 'Terraced',
  F: 'Flat/Maisonette',
  O: 'Other',
};

// Shared utility to convert a property type code to its label.
// Extracted here to eliminate duplicate helper functions in views.
export function getPropertyTypeLabel(code: string): string {
  return PROPERTY_TYPES[code] || 'Other';
}

export interface PropertyTypeBreakdown {
  propertyType: string;
  label: string;
  count: number;
  avgPrice: number;
  share: number;
}

export interface YearlyTrend {
  year: number;
  avgPrice: number;
  transactionCount: number;
  priceGrowthPct: number | null;
}

export type MarketSignal = 'strong-growth' | 'moderate-growth' | 'stable' | 'declining' | 'insufficient-data';

export interface MarketInsights {
  region: string;
  totalTransactions: number;
  avgPrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  priceRange: number;
  recentYearAvg: number | null;
  fiveYearGrowthPct: number | null;
  oneYearGrowthPct: number | null;
  recentYearVolume: number;
  affordabilityRatio: number;
  marketSignal: MarketSignal;
  propertyTypeBreakdown: PropertyTypeBreakdown[];
  yearlyTrends: YearlyTrend[];
  newBuildShare: number;
  freeholdShare: number;
}
