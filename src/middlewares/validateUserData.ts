import type { NextFunction, Request, Response } from 'express';
import type { UserData } from '../types/user';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export function validateUserData(
  req: Request<object, object, UserData>,
  res: Response,
  next: NextFunction,
): void {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    res.status(400).json({ message: 'Invalid user data' });
    return;
  }

  const { name, email, password } = req.body;

  if (
    !isText(name) ||
    !isText(email) ||
    !EMAIL_PATTERN.test(email.trim()) ||
    typeof password !== 'string' ||
    password.length < MIN_PASSWORD_LENGTH
  ) {
    res.status(400).json({ message: 'Invalid user data' });
    return;
  }

  next();
}
