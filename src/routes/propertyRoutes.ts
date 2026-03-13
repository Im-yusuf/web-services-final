import { Router } from 'express';
import { PropertyController } from '../controllers/propertyController';

const router = Router();

/**
 * @swagger
 * /api/trends:
 *   get:
 *     summary: Get price trends
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filter by region (town, district, or county)
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         description: Filter by year
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *           enum: [D, S, T, F, O]
 *         description: Property type (D=Detached, S=Semi, T=Terraced, F=Flat, O=Other)
 *     responses:
 *       200:
 *         description: Price trend data
 */
router.get('/trends', PropertyController.getTrends);

/**
 * @swagger
 * /api/heatmap:
 *   get:
 *     summary: Get average house price per region (heatmap data)
 *     tags: [Properties]
 *     responses:
 *       200:
 *         description: Heatmap data by county
 */
router.get('/heatmap', PropertyController.getHeatmap);

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get property listings with filters
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: integer
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *           enum: [D, S, T, F, O]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated property listings
 */
router.get('/properties', PropertyController.getProperties);

/**
 * @swagger
 * /api/regions:
 *   get:
 *     summary: Get list of available regions
 *     tags: [Properties]
 *     responses:
 *       200:
 *         description: List of regions
 */
router.get('/regions', PropertyController.getRegions);

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Get overall market statistics
 *     tags: [Properties]
 *     responses:
 *       200:
 *         description: Market statistics
 */
router.get('/stats', PropertyController.getStats);

export default router;
