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
