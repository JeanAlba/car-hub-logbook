import { AppError } from '../errors/appError';
import * as carRepository from '../repositories/carRepository';
import * as serviceRecordRepository from '../repositories/serviceRecordRepository';
import type {
  ServiceRecord,
  ServiceRecordData,
  ServiceRecordUpdateData,
  ServiceRecordUpdateFields,
} from '../types/serviceRecord';

export function calculateWarrantyExpiration(date: Date, months: number): Date {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();

  return new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(date.getUTCDate(), lastDay)),
  );
}

function pickEditableFields(data: ServiceRecordUpdateData): ServiceRecordUpdateFields {
  const date = new Date(`${data.date}T00:00:00.000Z`);

  return {
    type: data.type,
    description: data.description.trim(),
    cost: data.cost,
    date,
    mileage: data.mileage,
    ...(data.warrantyMonths === undefined
      ? {}
      : {
          warrantyMonths: data.warrantyMonths,
          warrantyExpiresAt: calculateWarrantyExpiration(date, data.warrantyMonths),
        }),
  };
}

export async function createServiceRecord(data: ServiceRecordData): Promise<ServiceRecord> {
  if (!(await carRepository.findById(data.carId))) {
    throw new AppError(404, 'Car not found');
  }

  return serviceRecordRepository.create({ carId: data.carId, ...pickEditableFields(data) });
}

export async function listServiceRecords(carId: string): Promise<ServiceRecord[]> {
  return serviceRecordRepository.listByCarId(carId);
}

export async function getServiceRecordById(id: string): Promise<ServiceRecord | null> {
  return serviceRecordRepository.findById(id);
}

export async function updateServiceRecord(
  id: string,
  data: ServiceRecordUpdateData,
): Promise<ServiceRecord | null> {
  return serviceRecordRepository.update(id, pickEditableFields(data));
}

export async function deleteServiceRecord(id: string): Promise<boolean> {
  return serviceRecordRepository.remove(id);
}
