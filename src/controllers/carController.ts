import type { Request, Response } from 'express';
import * as service from '../services/carService';
import type { CarData, CarUpdateData } from '../types/car';

type IdParams = { id: string };

export async function create(req: Request<object, object, CarData>, res: Response): Promise<void> {
  res.status(201).json(await service.createCar(req.body));
}

export async function list(
  req: Request<object, object, object, { userId: string }>,
  res: Response,
): Promise<void> {
  res.status(200).json(await service.listCars(req.query.userId));
}

export async function getById(req: Request<IdParams>, res: Response): Promise<void> {
  const car = await service.getCarById(req.params.id);
  if (!car) {
    res.status(404).json({ message: 'Car not found' });
    return;
  }
  res.status(200).json(car);
}

export async function update(
  req: Request<IdParams, object, CarUpdateData>,
  res: Response,
): Promise<void> {
  const car = await service.updateCar(req.params.id, req.body);
  if (!car) {
    res.status(404).json({ message: 'Car not found' });
    return;
  }
  res.status(200).json(car);
}

export async function remove(req: Request<IdParams>, res: Response): Promise<void> {
  if (!(await service.deleteCar(req.params.id))) {
    res.status(404).json({ message: 'Car not found' });
    return;
  }
  res.status(204).send();
}

export async function summary(req: Request<IdParams>, res: Response): Promise<void> {
  const carSummary = await service.getCarSummary(req.params.id);
  if (!carSummary) {
    res.status(404).json({ message: 'Car not found' });
    return;
  }
  res.status(200).json(carSummary);
}
