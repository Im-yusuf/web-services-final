export interface AuthPayload {
  userId: string;
  email: string;
}

export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TrendQuery {
  region?: string;
  year?: string;
  propertyType?: string;
}

export interface HeatmapData {
  region: string;
  avgPrice: number;
  totalSales: number;
}

export interface PropertyFilter {
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  page?: number;
  limit?: number;
}

export interface SaveListingInput {
  propertyId: string;
  notes?: string;
}

export interface MarketSummaryInput {
  region: string;
}

export interface TrendResult {
  year: number;
  month: number;
  avgPrice: number;
  transactionCount: number;
  priceGrowth: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
