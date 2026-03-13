// Controller for property-related endpoints (trends, heatmap, listings, regions, stats).
// Each method is a thin adapter from HTTP request to service call.
import { Request, Response } from 'express';
import { PropertyService } from '../services/propertyService';

export class PropertyController {
  static async getTrends(req: Request, res: Response): Promise<void> {
    try {
      const { region, year, propertyType } = req.query;
      const trends = await PropertyService.getTrends({
        region: region as string,
        year: year as string,
        propertyType: propertyType as string,
      });
      res.json({ success: true, data: trends });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch trends';
      res.status(500).json({ success: false, error: message });
    }
  }

  static async getHeatmap(_req: Request, res: Response): Promise<void> {
    try {
      const heatmap = await PropertyService.getHeatmap();
      res.json({ success: true, data: heatmap });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch heatmap data';
      res.status(500).json({ success: false, error: message });
    }
  }

  static async getProperties(req: Request, res: Response): Promise<void> {
    try {
      const { region, minPrice, maxPrice, propertyType, page, limit } = req.query;
      const result = await PropertyService.getProperties({
        region: region as string,
        minPrice: minPrice ? parseInt(minPrice as string, 10) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice as string, 10) : undefined,
        propertyType: propertyType as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch properties';
      res.status(500).json({ success: false, error: message });
    }
  }

  static async getRegions(_req: Request, res: Response): Promise<void> {
    try {
      const regions = await PropertyService.getRegions();
      res.json({ success: true, data: regions });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch regions';
      res.status(500).json({ success: false, error: message });
    }
  }

  static async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await PropertyService.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch stats';
      res.status(500).json({ success: false, error: message });
    }
  }
}
