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

// Middleware
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', propertyRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/insights', marketInsightsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

export default app;
