// Request body validation middleware using Zod schemas.
// Returns 400 with field-level error details if validation fails;
// replaces req.body with the parsed (and potentially coerced) data on success.
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }
    // Overwrite body with validated data so handlers receive clean input
    req.body = result.data;
    next();
  };
};
