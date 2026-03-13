// Integration tests for property endpoints: trends, heatmap, listings, regions, stats.
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Property Endpoints', () => {
  describe('GET /api/trends', () => {
    it('should return trend data', async () => {
      const res = await request(app)
        .get('/api/trends')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter by region', async () => {
      const res = await request(app)
        .get('/api/trends?region=LEEDS')
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should filter by year', async () => {
      const res = await request(app)
        .get('/api/trends?year=2023')
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should filter by property type', async () => {
      const res = await request(app)
        .get('/api/trends?propertyType=D')
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/heatmap', () => {
    it('should return heatmap data', async () => {
      const res = await request(app)
        .get('/api/heatmap')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/properties', () => {
    it('should return paginated properties', async () => {
      const res = await request(app)
        .get('/api/properties')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('items');
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('page');
      expect(res.body.data).toHaveProperty('totalPages');
    });

    it('should filter by price range', async () => {
      const res = await request(app)
        .get('/api/properties?minPrice=100000&maxPrice=300000')
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should respect page and limit', async () => {
      const res = await request(app)
        .get('/api/properties?page=1&limit=5')
        .expect(200);

      expect(res.body.data.items.length).toBeLessThanOrEqual(5);
      expect(res.body.data.limit).toBe(5);
    });
  });

  describe('GET /api/regions', () => {
    it('should return list of regions', async () => {
      const res = await request(app)
        .get('/api/regions')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/stats', () => {
    it('should return market stats', async () => {
      const res = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalProperties');
      expect(res.body.data).toHaveProperty('avgPrice');
    });
  });
});
