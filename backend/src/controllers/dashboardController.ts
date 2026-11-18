import type { Request, Response } from 'express';
import * as service from '../services/dashboardService';

export async function get(req: Request, res: Response): Promise<void> {
  res.status(200).json(await service.getDashboard(req.userId));
}
