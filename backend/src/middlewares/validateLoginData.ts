import type { NextFunction, Request, Response } from 'express';
import type { LoginData } from '../types/user';

const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export function validateLoginData(
  req: Request<object, object, LoginData>,
  res: Response,
  next: NextFunction,
): void {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    res.status(400).json({ message: 'Invalid login data' });
    return;
  }

  const { email, password } = req.body;

  if (!isText(email) || !isText(password)) {
    res.status(400).json({ message: 'Invalid login data' });
    return;
  }

  next();
}
