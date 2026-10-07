import { CarModel } from '../models/carModel';
import type { Car, CarData, CarUpdateData } from '../types/car';

export async function create(data: CarData): Promise<Car> {
  return (await CarModel.create(data)).toJSON() as unknown as Car;
}

export async function listByUserId(userId: string): Promise<Car[]> {
  return (await CarModel.find({ userId })).map((item) => item.toJSON() as unknown as Car);
}

export async function findById(id: string): Promise<Car | null> {
  const item = await CarModel.findById(id);
  return item ? (item.toJSON() as unknown as Car) : null;
}

export async function findByUserIdAndPlate(userId: string, plate: string): Promise<Car | null> {
  const item = await CarModel.findOne({ userId, plate });
  return item ? (item.toJSON() as unknown as Car) : null;
}

export async function update(id: string, data: CarUpdateData): Promise<Car | null> {
  const { nickname, ...fields } = data;
  const changes = nickname === undefined ? { ...fields, $unset: { nickname: '' } } : data;
  const item = await CarModel.findByIdAndUpdate(id, changes, { new: true, runValidators: true });
  return item ? (item.toJSON() as unknown as Car) : null;
}

export async function remove(id: string): Promise<boolean> {
  return (await CarModel.findByIdAndDelete(id)) !== null;
}
