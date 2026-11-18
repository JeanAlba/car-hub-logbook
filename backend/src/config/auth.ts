import type { CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = 'token';

const TOKEN_LIFETIME_SECONDS = 7 * 24 * 60 * 60;

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }

  return secret;
}

export function getTokenLifetimeSeconds(): number {
  return TOKEN_LIFETIME_SECONDS;
}

export function getCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };
}
