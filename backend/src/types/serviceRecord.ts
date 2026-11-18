export const SERVICE_RECORD_TYPES = ['MAINTENANCE', 'REPAIR', 'MODIFICATION', 'OTHER'] as const;

export type ServiceRecordType = (typeof SERVICE_RECORD_TYPES)[number];

export interface ServiceRecordData {
  carId: string;
  type: ServiceRecordType;
  description: string;
  cost: number;
  date: string;
  mileage: number;
  warrantyMonths?: number;
}

export type ServiceRecordUpdateData = Omit<ServiceRecordData, 'carId'>;

export interface ServiceRecord extends ServiceRecordData {
  id: string;
  warrantyExpiresAt?: string;
}

export type ServiceRecordUpdateFields = Omit<ServiceRecordUpdateData, 'date'> & {
  date: Date;
  warrantyExpiresAt?: Date;
};

export type ServiceRecordCreateFields = ServiceRecordUpdateFields & { carId: string };
