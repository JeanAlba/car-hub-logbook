import { AppError } from '../errors/appError';
import { isDuplicateKeyError } from '../errors/isDuplicateKeyError';
import * as carRepository from '../repositories/carRepository';
import * as serviceRecordRepository from '../repositories/serviceRecordRepository';
import * as userRepository from '../repositories/userRepository';
import type { Car, CarData, CarSummary, CarUpdateData } from '../types/car';
import { SERVICE_RECORD_TYPES } from '../types/serviceRecord';
import { normalizePlate } from '../utils/normalizePlate';

const duplicatedPlateError = (): AppError =>
  new AppError(409, 'Plate already registered for this user');

function pickEditableFields(data: CarUpdateData): CarUpdateData {
  const nickname = data.nickname?.trim();

  return {
    brand: data.brand.trim(),
    model: data.model.trim(),
    year: data.year,
    plate: normalizePlate(data.plate),
    mileage: data.mileage,
    ...(nickname ? { nickname } : {}),
  };
}

async function saveCar(save: () => Promise<Car | null>): Promise<Car | null> {
  try {
    return await save();
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw duplicatedPlateError();
    }
    throw error;
  }
}

export async function createCar(data: CarData): Promise<Car> {
  if (!(await userRepository.findById(data.userId))) {
    throw new AppError(404, 'User not found');
  }

  const fields = pickEditableFields(data);

  if (await carRepository.findByUserIdAndPlate(data.userId, fields.plate)) {
    throw duplicatedPlateError();
  }

  return (await saveCar(() => carRepository.create({ userId: data.userId, ...fields }))) as Car;
}

export async function listCars(userId: string): Promise<Car[]> {
  return carRepository.listByUserId(userId);
}

export async function getCarById(id: string): Promise<Car | null> {
  return carRepository.findById(id);
}

export async function updateCar(id: string, data: CarUpdateData): Promise<Car | null> {
  const car = await carRepository.findById(id);

  if (!car) {
    return null;
  }

  const fields = pickEditableFields(data);
  const samePlateCar = await carRepository.findByUserIdAndPlate(car.userId, fields.plate);

  if (samePlateCar && samePlateCar.id !== id) {
    throw duplicatedPlateError();
  }

  return saveCar(() => carRepository.update(id, fields));
}

export async function deleteCar(id: string): Promise<boolean> {
  const deleted = await carRepository.remove(id);

  if (deleted) {
    await serviceRecordRepository.removeByCarId(id);
  }

  return deleted;
}

const roundMoney = (value: number): number => Math.round(value * 100) / 100;

export async function getCarSummary(id: string): Promise<CarSummary | null> {
  if (!(await carRepository.findById(id))) {
    return null;
  }

  const records = await serviceRecordRepository.listByCarId(id);
  const spentByType = Object.fromEntries(
    SERVICE_RECORD_TYPES.map((type) => [type, 0]),
  ) as CarSummary['spentByType'];
  let totalSpent = 0;
  let lastServiceDate: string | null = null;

  for (const record of records) {
    totalSpent += record.cost;
    spentByType[record.type] += record.cost;
    if (lastServiceDate === null || record.date > lastServiceDate) {
      lastServiceDate = record.date;
    }
  }

  for (const type of SERVICE_RECORD_TYPES) {
    spentByType[type] = roundMoney(spentByType[type]);
  }

  return {
    totalSpent: roundMoney(totalSpent),
    recordsCount: records.length,
    lastServiceDate,
    spentByType,
  };
}
