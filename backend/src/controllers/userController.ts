import type { Request, Response } from 'express';
import { AUTH_COOKIE_NAME, getCookieOptions, getTokenLifetimeSeconds } from '../config/auth';
import * as service from '../services/userService';
import type { LoginData, UserData } from '../types/user';
import { signToken } from '../utils/token';

export async function create(req: Request<object, object, UserData>, res: Response): Promise<void> {
  res.status(201).json(await service.createUser(req.body));
}

export async function login(req: Request<object, object, LoginData>, res: Response): Promise<void> {
  const user = await service.login(req.body);

  res.cookie(AUTH_COOKIE_NAME, signToken(user.id), {
    ...getCookieOptions(),
    maxAge: getTokenLifetimeSeconds() * 1000,
  });
  res.status(200).json(user);
}

export function logout(_req: Request, res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, getCookieOptions());
  res.status(204).send();
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await service.getUserById(req.userId);

  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  res.status(200).json(user);
}
