import type { ServiceRecordType } from './serviceRecord';

export interface CarData {
  userId: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  mileage: number;
  nickname?: string;
}

export type CarUpdateData = Omit<CarData, 'userId'>;

export interface Car extends CarData {
  id: string;
}

export interface CarSummary {
  totalSpent: number;
  recordsCount: number;
  lastServiceDate: string | null;
  spentByType: Record<ServiceRecordType, number>;
}
