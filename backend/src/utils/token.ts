import jwt from 'jsonwebtoken';
import { getJwtSecret, getTokenLifetimeSeconds } from '../config/auth';

export function signToken(userId: string): string {
  return jwt.sign({}, getJwtSecret(), {
    subject: userId,
    expiresIn: getTokenLifetimeSeconds(),
  });
}

export function verifyToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, getJwtSecret());
    return typeof payload === 'object' && typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}
