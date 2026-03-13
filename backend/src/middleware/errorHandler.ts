// Global error handler — catches any unhandled errors thrown by route handlers.
// In production the raw message is hidden; in development it is exposed for debugging.
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('Unhandled error:', err.message);
  console.error(err.stack);

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
};
