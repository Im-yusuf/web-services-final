// Centralised environment configuration.
// Reads from .env via dotenv and exposes typed values used throughout the app.
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  // Comma-separated list of allowed CORS origins (supports multiple deployed URLs)
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim()),
} as const;
