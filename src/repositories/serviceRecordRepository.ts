import { ServiceRecordModel } from '../models/serviceRecordModel';

export async function removeByCarId(carId: string): Promise<void> {
  await ServiceRecordModel.deleteMany({ carId });
}
