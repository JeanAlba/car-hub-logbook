import type { NextFunction, Request, Response } from 'express';
import type { CarData, CarUpdateData } from '../types/car';
import { isValidId } from '../utils/isValidId';
import { normalizePlate } from '../utils/normalizePlate';

const MIN_YEAR = 1900;

const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isValidYear = (value: unknown): boolean =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= MIN_YEAR &&
  value <= new Date().getFullYear() + 1;

const isValidPlate = (value: unknown): boolean =>
  typeof value === 'string' && /^[A-Z0-9]{7}$/.test(normalizePlate(value));

const isValidMileage = (value: unknown): boolean =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

const isValidNickname = (value: unknown): boolean =>
  value === undefined || typeof value === 'string';

function hasValidFields(body: Partial<Record<keyof CarUpdateData, unknown>>): boolean {
  return (
    isText(body.brand) &&
    isText(body.model) &&
    isValidYear(body.year) &&
    isValidPlate(body.plate) &&
    isValidMileage(body.mileage) &&
    isValidNickname(body.nickname)
  );
}

export function validateCarData(
  req: Request<object, object, CarUpdateData>,
  res: Response,
  next: NextFunction,
): void {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    res.status(400).json({ message: 'Invalid car data' });
    return;
  }

  if (!hasValidFields(req.body)) {
    res.status(400).json({ message: 'Invalid car data' });
    return;
  }

  next();
}

export function validateCarId(
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

export function validateCarUserId(
  req: Request<object, object, Partial<CarData>>,
  res: Response,
  next: NextFunction,
): void {
  if (!req.body || typeof req.body !== 'object' || !isValidId(req.body.userId)) {
    res.status(400).json({ message: 'Invalid identifier' });
    return;
  }
  next();
}

export function validateCarUserIdQuery(
  req: Request<object, object, object, { userId: string }>,
  res: Response,
  next: NextFunction,
): void {
  if (!isValidId(req.query.userId)) {
    res.status(400).json({ message: 'Invalid identifier' });
    return;
  }
  next();
}
