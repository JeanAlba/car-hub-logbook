import { ServiceRecordModel } from '../models/serviceRecordModel';
import type {
  ServiceRecord,
  ServiceRecordCreateFields,
  ServiceRecordUpdateFields,
} from '../types/serviceRecord';

export async function create(data: ServiceRecordCreateFields): Promise<ServiceRecord> {
  return (await ServiceRecordModel.create(data)).toJSON() as unknown as ServiceRecord;
}

export async function listByCarId(carId: string): Promise<ServiceRecord[]> {
  return (await ServiceRecordModel.find({ carId }).sort({ date: -1 })).map(
    (item) => item.toJSON() as unknown as ServiceRecord,
  );
}

export async function findById(id: string): Promise<ServiceRecord | null> {
  const item = await ServiceRecordModel.findById(id);
  return item ? (item.toJSON() as unknown as ServiceRecord) : null;
}

export async function update(
  id: string,
  data: ServiceRecordUpdateFields,
): Promise<ServiceRecord | null> {
  const changes =
    data.warrantyMonths === undefined
      ? { ...data, $unset: { warrantyMonths: '', warrantyExpiresAt: '' } }
      : data;
  const item = await ServiceRecordModel.findByIdAndUpdate(id, changes, {
    new: true,
    runValidators: true,
  });
  return item ? (item.toJSON() as unknown as ServiceRecord) : null;
}

export async function remove(id: string): Promise<boolean> {
  return (await ServiceRecordModel.findByIdAndDelete(id)) !== null;
}

export async function removeByCarId(carId: string): Promise<void> {
  await ServiceRecordModel.deleteMany({ carId });
}
