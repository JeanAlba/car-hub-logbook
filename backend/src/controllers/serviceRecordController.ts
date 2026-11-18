import type { Request, Response } from 'express';
import * as service from '../services/serviceRecordService';
import type { ServiceRecordData, ServiceRecordUpdateData } from '../types/serviceRecord';

type IdParams = { id: string };

export async function create(
  req: Request<object, object, ServiceRecordData>,
  res: Response,
): Promise<void> {
  res.status(201).json(await service.createServiceRecord(req.body));
}

export async function list(
  req: Request<object, object, object, { carId: string }>,
  res: Response,
): Promise<void> {
  res.status(200).json(await service.listServiceRecords(req.query.carId));
}

export async function getById(req: Request<IdParams>, res: Response): Promise<void> {
  const record = await service.getServiceRecordById(req.params.id);
  if (!record) {
    res.status(404).json({ message: 'Service record not found' });
    return;
  }
  res.status(200).json(record);
}

export async function update(
  req: Request<IdParams, object, ServiceRecordUpdateData>,
  res: Response,
): Promise<void> {
  const record = await service.updateServiceRecord(req.params.id, req.body);
  if (!record) {
    res.status(404).json({ message: 'Service record not found' });
    return;
  }
  res.status(200).json(record);
}

export async function remove(req: Request<IdParams>, res: Response): Promise<void> {
  if (!(await service.deleteServiceRecord(req.params.id))) {
    res.status(404).json({ message: 'Service record not found' });
    return;
  }
  res.status(204).send();
}
