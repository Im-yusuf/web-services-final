import { Request, Response } from 'express';
import { SavedListingService } from '../services/savedListingService';

export class SavedListingController {
  static async save(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { propertyId, notes } = req.body;
      const listing = await SavedListingService.save(userId, { propertyId, notes });
      res.status(201).json({ success: true, data: listing });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save listing';
      const status = message === 'Property not found' ? 404 : 500;
      res.status(status).json({ success: false, error: message });
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const listings = await SavedListingService.getAll(userId);
      res.json({ success: true, data: listings });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch saved listings';
      res.status(500).json({ success: false, error: message });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      await SavedListingService.delete(userId, id);
      res.json({ success: true, message: 'Listing removed' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete listing';
      const status = message === 'Saved listing not found' ? 404 : 500;
      res.status(status).json({ success: false, error: message });
    }
  }
}
