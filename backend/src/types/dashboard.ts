import type { ServiceRecord } from './serviceRecord';

export type WarrantyAlertStatus = 'EXPIRING' | 'EXPIRED';

export interface WarrantyAlert {
  id: string;
  carId: string;
  carName: string;
  carPlate: string;
  description: string;
  warrantyExpiresAt: string;
  daysRemaining: number;
  status: WarrantyAlertStatus;
}

export interface DashboardRecentRecord extends ServiceRecord {
  carName: string;
  carPlate: string;
}

export interface CarSpendItem {
  carId: string;
  carName: string;
  carPlate: string;
  totalSpent: number;
  recordsCount: number;
}

export interface DashboardSummary {
  carsCount: number;
  recordsCount: number;
  totalSpent: number;
  spentLast30Days: number;
  warranties: {
    activeCount: number;
    expiringCount: number;
    expiredCount: number;
    alerts: WarrantyAlert[];
  };
  spentByCar: CarSpendItem[];
  recentRecords: DashboardRecentRecord[];
}
