import { Router } from 'express';
import { MarketInsightsController } from '../controllers/marketInsightsController';

const router = Router();

/**
 * @swagger
 * /api/insights/region:
 *   post:
 *     summary: Get data-driven market insights for a region
 *     tags: [Market Insights]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [region]
 *             properties:
 *               region:
 *                 type: string
 *                 example: Leeds
 *     responses:
 *       200:
 *         description: Structured market insights derived from Land Registry data
 *       400:
 *         description: Region is required
 */
router.post('/region', MarketInsightsController.getRegionInsights);

export default router;
