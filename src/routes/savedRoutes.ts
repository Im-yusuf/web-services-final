import { Router } from 'express';
import { SavedListingController } from '../controllers/savedListingController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const saveSchema = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
  notes: z.string().max(500).optional(),
});

/**
 * @swagger
 * /api/saved:
 *   post:
 *     summary: Save a property listing
 *     tags: [Saved Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [propertyId]
 *             properties:
 *               propertyId:
 *                 type: string
 *                 format: uuid
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Listing saved
 *       404:
 *         description: Property not found
 */
router.post('/', authMiddleware, validate(saveSchema), SavedListingController.save);

/**
 * @swagger
 * /api/saved:
 *   get:
 *     summary: Get all saved listings for current user
 *     tags: [Saved Listings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved listings
 */
router.get('/', authMiddleware, SavedListingController.getAll);

/**
 * @swagger
 * /api/saved/{id}:
 *   delete:
 *     summary: Delete a saved listing
 *     tags: [Saved Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listing removed
 *       404:
 *         description: Listing not found
 */
router.delete('/:id', authMiddleware, SavedListingController.delete);

export default router;
