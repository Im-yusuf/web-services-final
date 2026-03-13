import prisma from '../utils/prisma';
import { TrendQuery, PropertyFilter, HeatmapData, TrendResult, PaginatedResponse } from '../types';
import { PropertySale, Prisma } from '@prisma/client';

export class PropertyService {
  static async getTrends(query: TrendQuery): Promise<TrendResult[]> {
    const where: Prisma.PropertySaleWhereInput = {};

    if (query.region) {
      where.OR = [
        { townCity: { equals: query.region, mode: 'insensitive' } },
        { district: { equals: query.region, mode: 'insensitive' } },
        { county: { equals: query.region, mode: 'insensitive' } },
      ];
    }

    if (query.year) {
      const year = parseInt(query.year, 10);
      where.transferDate = {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      };
    }

    if (query.propertyType) {
      where.propertyType = query.propertyType;
    }

    const sales = await prisma.propertySale.findMany({
      where,
      select: {
        price: true,
        transferDate: true,
      },
      orderBy: { transferDate: 'asc' },
    });

    const grouped = new Map<string, { totalPrice: number; count: number }>();
    for (const sale of sales) {
      const date = new Date(sale.transferDate);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const existing = grouped.get(key) || { totalPrice: 0, count: 0 };
      existing.totalPrice += sale.price;
      existing.count += 1;
      grouped.set(key, existing);
    }

    const results: TrendResult[] = [];
    let prevAvg = 0;

    const sortedKeys = Array.from(grouped.keys()).sort();
    for (const key of sortedKeys) {
      const [yearStr, monthStr] = key.split('-');
      const data = grouped.get(key)!;
      const avgPrice = Math.round(data.totalPrice / data.count);
      const priceGrowth = prevAvg > 0 ? parseFloat((((avgPrice - prevAvg) / prevAvg) * 100).toFixed(2)) : 0;
      prevAvg = avgPrice;

      results.push({
        year: parseInt(yearStr, 10),
        month: parseInt(monthStr, 10),
        avgPrice,
        transactionCount: data.count,
        priceGrowth,
      });
    }

    return results;
  }

  static async getHeatmap(): Promise<HeatmapData[]> {
    const results = await prisma.propertySale.groupBy({
      by: ['county'],
      _avg: { price: true },
      _count: { id: true },
      orderBy: { _avg: { price: 'desc' } },
    });

    return results.map((r) => ({
      region: r.county,
      avgPrice: Math.round(r._avg.price || 0),
      totalSales: r._count.id,
    }));
  }

  static async getProperties(filter: PropertyFilter): Promise<PaginatedResponse<PropertySale>> {
    const page = filter.page || 1;
    const limit = Math.min(filter.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.PropertySaleWhereInput = {};

    if (filter.region) {
      where.OR = [
        { townCity: { equals: filter.region, mode: 'insensitive' } },
        { district: { equals: filter.region, mode: 'insensitive' } },
        { county: { equals: filter.region, mode: 'insensitive' } },
      ];
    }

    if (filter.minPrice || filter.maxPrice) {
      where.price = {};
      if (filter.minPrice) where.price.gte = filter.minPrice;
      if (filter.maxPrice) where.price.lte = filter.maxPrice;
    }

    if (filter.propertyType) {
      where.propertyType = filter.propertyType;
    }

    const [items, total] = await Promise.all([
      prisma.propertySale.findMany({
        where,
        skip,
        take: limit,
        orderBy: { transferDate: 'desc' },
      }),
      prisma.propertySale.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getPropertyById(id: string) {
    return prisma.propertySale.findUnique({ where: { id } });
  }

  static async getRegions(): Promise<string[]> {
    const results = await prisma.propertySale.findMany({
      select: { county: true },
      distinct: ['county'],
      orderBy: { county: 'asc' },
    });
    return results.map((r) => r.county);
  }

  static async getStats() {
    const [totalProperties, avgPrice, latestSale] = await Promise.all([
      prisma.propertySale.count(),
      prisma.propertySale.aggregate({ _avg: { price: true } }),
      prisma.propertySale.findFirst({ orderBy: { transferDate: 'desc' } }),
    ]);

    return {
      totalProperties,
      avgPrice: Math.round(avgPrice._avg.price || 0),
      latestSaleDate: latestSale?.transferDate || null,
    };
  }
}
