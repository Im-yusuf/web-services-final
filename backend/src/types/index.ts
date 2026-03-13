// Shared TypeScript interfaces used across controllers, services, and routes.
// Defines the shape of request inputs, API responses, and query parameters.

// Payload attached to req.user after session token validation
export interface AuthPayload {
  userId: string;
  email: string;
}

// Input for the registration endpoint
export interface RegisterInput {
  email: string;
  password: string;
}

// Input for the login endpoint
export interface LoginInput {
  email: string;
  password: string;
}

// Query parameters accepted by the trends endpoint
export interface TrendQuery {
  region?: string;
  year?: string;
  propertyType?: string;
}

// Shape of each item returned by the heatmap endpoint
export interface HeatmapData {
  region: string;
  avgPrice: number;
  totalSales: number;
}

// Query parameters accepted by the properties listing endpoint
export interface PropertyFilter {
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  page?: number;
  limit?: number;
}

// Input for saving a property listing
export interface SaveListingInput {
  propertyId: string;
  notes?: string;
}

// Input for the market insights endpoint
export interface MarketSummaryInput {
  region: string;
}

// Single data point in a trend series (year-month granularity)
export interface TrendResult {
  year: number;
  month: number;
  avgPrice: number;
  transactionCount: number;
  priceGrowth: number;
}

// Generic API response envelope used by all endpoints
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Paginated response wrapper used by the properties listing
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
