// Controller for the market insights endpoint.
// Accepts a region name and returns computed analytics from Land Registry data.
import { Request, Response } from 'express';
import { MarketInsightsService } from '../services/marketInsightsService';

export class MarketInsightsController {
  static async getRegionInsights(req: Request, res: Response): Promise<void> {
    try {
      const { region } = req.body;
      if (!region || typeof region !== 'string') {
        res.status(400).json({ success: false, error: 'Region is required' });
        return;
      }

      const insights = await MarketInsightsService.getRegionInsights(region.trim());
      res.json({ success: true, data: insights });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to compute market insights';
      res.status(500).json({ success: false, error: message });
    }
  }
}
