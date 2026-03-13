// Express application setup — configures middleware, mounts route groups,
// serves Swagger docs, and attaches the global error handler.
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { config } from './utils/config';
import { swaggerSpec } from './utils/swagger';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import propertyRoutes from './routes/propertyRoutes';
import savedRoutes from './routes/savedRoutes';
import marketInsightsRoutes from './routes/marketInsightsRoutes';

const app = express();

// --- Core middleware ---
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());

// --- Swagger / OpenAPI documentation ---
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// --- Route groups ---
app.use('/api/auth', authRoutes);           // Registration, login, logout, me
app.use('/api', propertyRoutes);            // Trends, heatmap, properties, regions, stats
app.use('/api/saved', savedRoutes);         // Saved listings (auth required)
app.use('/api/insights', marketInsightsRoutes); // Market insights

// --- Health check ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Global error handler (must be registered last) ---
app.use(errorHandler);

export default app;
