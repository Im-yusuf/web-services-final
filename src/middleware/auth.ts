import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Access token required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) {
      res.status(401).json({ success: false, error: 'Invalid or expired token' });
      return;
    }

    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      res.status(401).json({ success: false, error: 'Invalid or expired token' });
      return;
    }

    req.user = { userId: session.user.id, email: session.user.email };
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};
