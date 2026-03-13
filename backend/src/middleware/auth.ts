// Authentication middleware — validates the Bearer session token
// against the sessions table. Attaches the user payload to req.user
// so downstream handlers can identify the caller.
import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthPayload } from '../types';

// Extend the Express Request type globally so req.user is available everywhere
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  // Require a Bearer token in the Authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Access token required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // Look up the session and eagerly load the associated user
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) {
      res.status(401).json({ success: false, error: 'Invalid or expired token' });
      return;
    }

    if (session.expiresAt < new Date()) {
      // Token has expired — clean it up and reject
      await prisma.session.delete({ where: { id: session.id } });
      res.status(401).json({ success: false, error: 'Invalid or expired token' });
      return;
    }

    // Attach the minimal user payload for downstream handlers
    req.user = { userId: session.user.id, email: session.user.email };
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};
