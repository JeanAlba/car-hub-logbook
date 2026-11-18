import { AppError } from '../errors/appError';
import { isDuplicateKeyError } from '../errors/isDuplicateKeyError';
import * as carRepository from '../repositories/carRepository';
import * as serviceRecordRepository from '../repositories/serviceRecordRepository';
import * as userRepository from '../repositories/userRepository';
import type { Car, CarData, CarSummary, CarUpdateData } from '../types/car';
import { SERVICE_RECORD_TYPES } from '../types/serviceRecord';
import { getRecentMonthKeys, roundMoney } from '../utils/metrics';
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

export async function getCarSummary(
  id: string,
  referenceDate = new Date(),
): Promise<CarSummary | null> {
  const car = await carRepository.findById(id);

  if (!car) {
    return null;
  }

  const records = await serviceRecordRepository.listByCarId(id);
  const spentByType = Object.fromEntries(
    SERVICE_RECORD_TYPES.map((type) => [type, 0]),
  ) as CarSummary['spentByType'];
  const monthKeys = getRecentMonthKeys(referenceDate);
  const monthTotals = new Map(monthKeys.map((month) => [month, 0]));
  let totalSpent = 0;
  let lastServiceDate: string | null = null;

  for (const record of records) {
    totalSpent += record.cost;
    spentByType[record.type] += record.cost;
    const month = record.date.slice(0, 7);
    const existing = monthTotals.get(month);
    if (existing !== undefined) {
      monthTotals.set(month, existing + record.cost);
    }
    if (lastServiceDate === null || record.date > lastServiceDate) {
      lastServiceDate = record.date;
    }
  }

  for (const type of SERVICE_RECORD_TYPES) {
    spentByType[type] = roundMoney(spentByType[type]);
  }

  const roundedTotal = roundMoney(totalSpent);
  const costPerKm =
    car.mileage > 0 && records.length > 0 ? roundMoney(roundedTotal / car.mileage) : null;

  return {
    totalSpent: roundedTotal,
    recordsCount: records.length,
    lastServiceDate,
    costPerKm,
    spentByType,
    spentByMonth: monthKeys.map((month) => ({
      month,
      total: roundMoney(monthTotals.get(month) ?? 0),
    })),
  };
}
