import type { NextFunction, Request, Response } from 'express';
import * as carRepository from '../repositories/carRepository';
import * as serviceRecordRepository from '../repositories/serviceRecordRepository';

async function userOwnsCar(userId: string, carId: string): Promise<boolean> {
  const car = await carRepository.findById(carId);
  return car?.userId === userId;
}

export async function authorizeCarFromParams(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!(await userOwnsCar(req.userId, req.params.id))) {
    res.status(404).json({ message: 'Car not found' });
    return;
  }
  next();
}

export async function authorizeCarFromBody(
  req: Request<object, object, { carId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!(await userOwnsCar(req.userId, req.body.carId))) {
    res.status(404).json({ message: 'Car not found' });
    return;
  }
  next();
}

export async function authorizeCarFromQuery(
  req: Request<object, object, object, { carId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!(await userOwnsCar(req.userId, req.query.carId))) {
    res.status(404).json({ message: 'Car not found' });
    return;
  }
  next();
}

export async function authorizeServiceRecordFromParams(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const record = await serviceRecordRepository.findById(req.params.id);

  if (!record || !(await userOwnsCar(req.userId, record.carId))) {
    res.status(404).json({ message: 'Service record not found' });
    return;
  }
  next();
}
