export interface User {
  id: string
  name: string
  email: string
}

export const SERVICE_RECORD_TYPES = ['MAINTENANCE', 'REPAIR', 'MODIFICATION', 'OTHER'] as const

export type ServiceRecordType = (typeof SERVICE_RECORD_TYPES)[number]

export interface CarFields {
  brand: string
  model: string
  year: number
  plate: string
  mileage: number
  nickname?: string
}

export interface Car extends CarFields {
  id: string
  userId: string
}

export interface ServiceRecordFields {
  type: ServiceRecordType
  description: string
  cost: number
  date: string
  mileage: number
  warrantyMonths?: number
}

export interface ServiceRecord extends ServiceRecordFields {
  id: string
  carId: string
  warrantyExpiresAt?: string
}

export interface MonthlySpend {
  month: string
  total: number
}

export interface CarSummary {
  totalSpent: number
  recordsCount: number
  lastServiceDate: string | null
  costPerKm: number | null
  spentByType: Record<ServiceRecordType, number>
  spentByMonth: MonthlySpend[]
}

export type WarrantyAlertStatus = 'EXPIRING' | 'EXPIRED'

export interface WarrantyAlert {
  id: string
  carId: string
  carName: string
  carPlate: string
  description: string
  warrantyExpiresAt: string
  daysRemaining: number
  status: WarrantyAlertStatus
}

export interface DashboardRecentRecord extends ServiceRecord {
  carName: string
  carPlate: string
}

export interface CarSpendItem {
  carId: string
  carName: string
  carPlate: string
  totalSpent: number
  recordsCount: number
}

export interface DashboardSummary {
  carsCount: number
  recordsCount: number
  totalSpent: number
  spentLast30Days: number
  warranties: {
    activeCount: number
    expiringCount: number
    expiredCount: number
    alerts: WarrantyAlert[]
  }
  spentByCar: CarSpendItem[]
  recentRecords: DashboardRecentRecord[]
}
