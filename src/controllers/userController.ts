import type { Request, Response } from 'express';
import * as service from '../services/userService';
import type { LoginData, UserData } from '../types/user';

export async function create(req: Request<object, object, UserData>, res: Response): Promise<void> {
  res.status(201).json(await service.createUser(req.body));
}

export async function login(req: Request<object, object, LoginData>, res: Response): Promise<void> {
  res.status(200).json(await service.login(req.body));
}
