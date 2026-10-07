import type { NextFunction, Request, Response } from 'express';
import type { ServiceRecordData, ServiceRecordUpdateData } from '../types/serviceRecord';
import { SERVICE_RECORD_TYPES } from '../types/serviceRecord';
import { isValidId } from '../utils/isValidId';

const MIN_WARRANTY_MONTHS = 1;
const MAX_WARRANTY_MONTHS = 120;

const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isValidType = (value: unknown): boolean =>
  SERVICE_RECORD_TYPES.some((type) => type === value);

const isNonNegativeNumber = (value: unknown): boolean =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

function isRealDate(value: unknown): boolean {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

const isValidWarrantyMonths = (value: unknown): boolean =>
  value === undefined ||
  (typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= MIN_WARRANTY_MONTHS &&
    value <= MAX_WARRANTY_MONTHS);

function hasValidFields(body: Partial<Record<keyof ServiceRecordUpdateData, unknown>>): boolean {
  return (
    isValidType(body.type) &&
    isText(body.description) &&
    isNonNegativeNumber(body.cost) &&
    isRealDate(body.date) &&
    isNonNegativeNumber(body.mileage) &&
    isValidWarrantyMonths(body.warrantyMonths)
  );
}

export function validateServiceRecordData(
  req: Request<object, object, ServiceRecordUpdateData>,
  res: Response,
  next: NextFunction,
): void {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    res.status(400).json({ message: 'Invalid service record data' });
    return;
  }

  if (!hasValidFields(req.body)) {
    res.status(400).json({ message: 'Invalid service record data' });
    return;
  }

  next();
}

export function validateServiceRecordId(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): void {
  if (!isValidId(req.params.id)) {
    res.status(400).json({ message: 'Invalid identifier' });
    return;
  }
  next();
}

export function validateServiceRecordCarId(
  req: Request<object, object, Partial<ServiceRecordData>>,
  res: Response,
  next: NextFunction,
): void {
  if (!req.body || typeof req.body !== 'object' || !isValidId(req.body.carId)) {
    res.status(400).json({ message: 'Invalid identifier' });
    return;
  }
  next();
}

export function validateServiceRecordCarIdQuery(
  req: Request<object, object, object, { carId: string }>,
  res: Response,
  next: NextFunction,
): void {
  if (!isValidId(req.query.carId)) {
    res.status(400).json({ message: 'Invalid identifier' });
    return;
  }
  next();
}
