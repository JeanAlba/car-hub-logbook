import { Router, type Request, type Response } from 'express';

export const routes = Router();

routes.get('/health', (_req: Request, res: Response): void => {
  res.status(200).json({ status: 'ok' });
});
