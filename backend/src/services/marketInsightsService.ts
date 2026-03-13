// Market Insights service — computes rich analytics for a given region
// by aggregating Land Registry data with time-window comparisons.
// Used by the /api/insights/region endpoint and the frontend Market Assistant.
import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

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
  priceGrowthPct: number;
}

export interface MarketInsights {
  region: string;
  totalTransactions: number;
  avgPrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  priceRange: number;
  recentYearAvg: number;
  fiveYearGrowthPct: number | null;
  oneYearGrowthPct: number | null;
  recentYearVolume: number;
  affordabilityRatio: number;
  marketSignal: 'strong-growth' | 'moderate-growth' | 'stable' | 'declining' | 'insufficient-data';
  propertyTypeBreakdown: PropertyTypeBreakdown[];
  yearlyTrends: YearlyTrend[];
  newBuildShare: number;
  freeholdShare: number;
}

// Human-readable labels for the single-letter property type codes in the Land Registry data
const PROPERTY_TYPE_LABELS: Record<string, string> = {
  D: 'Detached',
  S: 'Semi-Detached',
  T: 'Terraced',
  F: 'Flat/Maisonette',
  O: 'Other',
};

// Approximate UK median household income — used to calculate the affordability ratio
const UK_MEDIAN_HOUSEHOLD_INCOME = 35000;

export class MarketInsightsService {
  // Main entry point — runs multiple parallel aggregations to build a complete
  // market profile for the specified region (matched against town, district, or county).
  static async getRegionInsights(region: string): Promise<MarketInsights> {
    const where: Prisma.PropertySaleWhereInput = {
      OR: [
        { townCity: { equals: region, mode: 'insensitive' } },
        { district: { equals: region, mode: 'insensitive' } },
        { county: { equals: region, mode: 'insensitive' } },
      ],
    };

    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
    const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
    const sixYearsAgo = new Date(now.getFullYear() - 6, now.getMonth(), now.getDate());

    // Run all independent aggregation queries in parallel for performance
    const [
      totalTransactions,
      priceStats,
      recentYearAgg,
      prevYearAgg,
      fiveYearRecentAgg,
      fiveYearOldAgg,
      typeBreakdown,
      tenureStats,
      newBuildStats,
    ] = await Promise.all([
      prisma.propertySale.count({ where }),

      prisma.propertySale.aggregate({
        where,
        _avg: { price: true },
        _min: { price: true },
        _max: { price: true },
      }),

      prisma.propertySale.aggregate({
        where: { ...where, transferDate: { gte: oneYearAgo } },
        _avg: { price: true },
        _count: { id: true },
      }),

      prisma.propertySale.aggregate({
        where: { ...where, transferDate: { gte: twoYearsAgo, lt: oneYearAgo } },
        _avg: { price: true },
        _count: { id: true },
      }),

      prisma.propertySale.aggregate({
        where: { ...where, transferDate: { gte: oneYearAgo } },
        _avg: { price: true },
      }),

      prisma.propertySale.aggregate({
        where: { ...where, transferDate: { gte: sixYearsAgo, lt: fiveYearsAgo } },
        _avg: { price: true },
      }),

      prisma.propertySale.groupBy({
        by: ['propertyType'],
        where,
        _count: { id: true },
        _avg: { price: true },
        orderBy: { _count: { id: 'desc' } },
      }),

      prisma.propertySale.groupBy({
        by: ['tenure'],
        where,
        _count: { id: true },
      }),

      prisma.propertySale.groupBy({
        by: ['newBuild'],
        where,
        _count: { id: true },
      }),
    ]);

    const yearlyTrends = await MarketInsightsService.computeYearlyTrends(where);

    const avgPrice = Math.round(priceStats._avg.price || 0);
    const minPrice = priceStats._min.price || 0;
    const maxPrice = priceStats._max.price || 0;

    const recentYearAvg = Math.round(recentYearAgg._avg.price || 0);
    const prevYearAvg = Math.round(prevYearAgg._avg.price || 0);
    const fiveYearEndAvg = Math.round(fiveYearRecentAgg._avg.price || 0);
    const fiveYearStartAvg = Math.round(fiveYearOldAgg._avg.price || 0);

    const oneYearGrowthPct =
      prevYearAvg > 0
        ? parseFloat((((recentYearAvg - prevYearAvg) / prevYearAvg) * 100).toFixed(1))
        : null;

    const fiveYearGrowthPct =
      fiveYearStartAvg > 0
        ? parseFloat((((fiveYearEndAvg - fiveYearStartAvg) / fiveYearStartAvg) * 100).toFixed(1))
        : null;

    const affordabilityRatio =
      avgPrice > 0 ? parseFloat((avgPrice / UK_MEDIAN_HOUSEHOLD_INCOME).toFixed(1)) : 0;

    const marketSignal = MarketInsightsService.deriveMarketSignal(
      oneYearGrowthPct,
      totalTransactions
    );

    const propertyTypeBreakdown: PropertyTypeBreakdown[] = typeBreakdown.map((t) => ({
      propertyType: t.propertyType,
      label: PROPERTY_TYPE_LABELS[t.propertyType] || t.propertyType,
      count: t._count.id,
      avgPrice: Math.round(t._avg.price || 0),
      share: totalTransactions > 0
        ? parseFloat(((t._count.id / totalTransactions) * 100).toFixed(1))
        : 0,
    }));

    const totalTenure = tenureStats.reduce((s, t) => s + t._count.id, 0);
    const freeholdCount = tenureStats.find((t) => t.tenure === 'Freehold')?._count.id ?? 0;
    const freeholdShare =
      totalTenure > 0 ? parseFloat(((freeholdCount / totalTenure) * 100).toFixed(1)) : 0;

    const totalBuilds = newBuildStats.reduce((s, t) => s + t._count.id, 0);
    const newBuildCount = newBuildStats.find((t) => t.newBuild === true)?._count.id ?? 0;
    const newBuildShare =
      totalBuilds > 0 ? parseFloat(((newBuildCount / totalBuilds) * 100).toFixed(1)) : 0;

    const medianPrice = Math.round((avgPrice + (minPrice + maxPrice) / 2) / 2);

    return {
      region,
      totalTransactions,
      avgPrice,
      medianPrice,
      minPrice,
      maxPrice,
      priceRange: maxPrice - minPrice,
      recentYearAvg,
      fiveYearGrowthPct,
      oneYearGrowthPct,
      recentYearVolume: recentYearAgg._count.id,
      affordabilityRatio,
      marketSignal,
      propertyTypeBreakdown,
      yearlyTrends,
      newBuildShare,
      freeholdShare,
    };
  }

  // Build year-over-year price trends by fetching all matching sales,
  // grouping by year, and calculating percentage growth between consecutive years.
  private static async computeYearlyTrends(
    where: Prisma.PropertySaleWhereInput
  ): Promise<YearlyTrend[]> {
    const sales = await prisma.propertySale.findMany({
      where,
      select: { price: true, transferDate: true },
      orderBy: { transferDate: 'asc' },
    });

    const byYear = new Map<number, { total: number; count: number }>();
    for (const s of sales) {
      const year = new Date(s.transferDate).getFullYear();
      const existing = byYear.get(year) || { total: 0, count: 0 };
      existing.total += s.price;
      existing.count += 1;
      byYear.set(year, existing);
    }

    const years = Array.from(byYear.keys()).sort();
    const trends: YearlyTrend[] = [];
    let prevAvg = 0;

    for (const year of years) {
      const { total, count } = byYear.get(year)!;
      const avgPrice = Math.round(total / count);
      const priceGrowthPct =
        prevAvg > 0
          ? parseFloat((((avgPrice - prevAvg) / prevAvg) * 100).toFixed(1))
          : 0;
      trends.push({ year, avgPrice, transactionCount: count, priceGrowthPct });
      prevAvg = avgPrice;
    }

    return trends;
  }

  // Classify the market based on recent price movement and data volume.
  // Returns one of: strong-growth, moderate-growth, stable, declining, insufficient-data.
  private static deriveMarketSignal(
    oneYearGrowthPct: number | null,
    totalTransactions: number
  ): MarketInsights['marketSignal'] {
    if (totalTransactions < 10 || oneYearGrowthPct === null) return 'insufficient-data';
    if (oneYearGrowthPct >= 5) return 'strong-growth';
    if (oneYearGrowthPct >= 1) return 'moderate-growth';
    if (oneYearGrowthPct >= -1) return 'stable';
    return 'declining';
  }
}
