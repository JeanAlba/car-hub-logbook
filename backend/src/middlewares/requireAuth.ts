import type { NextFunction, Request, Response } from 'express';
import { AUTH_COOKIE_NAME } from '../config/auth';
import { verifyToken } from '../utils/token';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token: unknown = req.cookies?.[AUTH_COOKIE_NAME];
  const userId = typeof token === 'string' ? verifyToken(token) : null;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  req.userId = userId;
  next();
}
