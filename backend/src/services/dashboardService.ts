import * as carRepository from '../repositories/carRepository';
import * as serviceRecordRepository from '../repositories/serviceRecordRepository';
import type { Car } from '../types/car';
import type { CarSpendItem, DashboardSummary, WarrantyAlert } from '../types/dashboard';
import type { ServiceRecord } from '../types/serviceRecord';
import { addUtcDays, diffUtcDays, roundMoney, toUtcIsoDate } from '../utils/metrics';

const EXPIRING_THRESHOLD_DAYS = 30;
const RECENT_WINDOW_DAYS = 30;
const RECENT_RECORDS_LIMIT = 5;
const WARRANTY_ALERTS_LIMIT = 8;

const formatCarName = (car: Car): string => `${car.brand} ${car.model}`;

function sortWarrantyAlerts(alerts: WarrantyAlert[]): WarrantyAlert[] {
  return [...alerts].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'EXPIRING' ? -1 : 1;
    }
    return a.status === 'EXPIRING'
      ? a.daysRemaining - b.daysRemaining
      : b.daysRemaining - a.daysRemaining;
  });
}

function createAlert(
  record: ServiceRecord,
  car: Car,
  daysRemaining: number,
  status: WarrantyAlert['status'],
): WarrantyAlert {
  return {
    id: record.id,
    carId: car.id,
    carName: formatCarName(car),
    carPlate: car.plate,
    description: record.description,
    warrantyExpiresAt: record.warrantyExpiresAt as string,
    daysRemaining,
    status,
  };
}

function summarizeWarranties(
  records: ServiceRecord[],
  carMap: Map<string, Car>,
  todayIso: string,
): DashboardSummary['warranties'] {
  let activeCount = 0;
  let expiringCount = 0;
  let expiredCount = 0;
  const alerts: WarrantyAlert[] = [];

  for (const record of records) {
    if (!record.warrantyExpiresAt) {
      continue;
    }
    const daysRemaining = diffUtcDays(todayIso, record.warrantyExpiresAt);
    const car = carMap.get(record.carId);

    if (daysRemaining < 0) {
      expiredCount += 1;
      if (car) {
        alerts.push(createAlert(record, car, daysRemaining, 'EXPIRED'));
      }
    } else if (daysRemaining <= EXPIRING_THRESHOLD_DAYS) {
      expiringCount += 1;
      if (car) {
        alerts.push(createAlert(record, car, daysRemaining, 'EXPIRING'));
      }
    } else {
      activeCount += 1;
    }
  }

  return {
    activeCount,
    expiringCount,
    expiredCount,
    alerts: sortWarrantyAlerts(alerts).slice(0, WARRANTY_ALERTS_LIMIT),
  };
}

export async function getDashboard(
  userId: string,
  referenceDate = new Date(),
): Promise<DashboardSummary> {
  const cars = await carRepository.listByUserId(userId);

  if (cars.length === 0) {
    return {
      carsCount: 0,
      recordsCount: 0,
      totalSpent: 0,
      spentLast30Days: 0,
      warranties: { activeCount: 0, expiringCount: 0, expiredCount: 0, alerts: [] },
      spentByCar: [],
      recentRecords: [],
    };
  }

  const carMap = new Map(cars.map((car) => [car.id, car]));
  const carSpendMap = new Map<string, CarSpendItem>(
    cars.map((car) => [
      car.id,
      {
        carId: car.id,
        carName: formatCarName(car),
        carPlate: car.plate,
        totalSpent: 0,
        recordsCount: 0,
      },
    ]),
  );

  const records = await serviceRecordRepository.listByCarIds(cars.map((car) => car.id));
  const todayIso = toUtcIsoDate(referenceDate);
  const last30DaysIso = toUtcIsoDate(addUtcDays(referenceDate, -RECENT_WINDOW_DAYS));

  let totalSpent = 0;
  let spentLast30Days = 0;

  for (const record of records) {
    totalSpent += record.cost;
    if (record.date >= last30DaysIso && record.date <= todayIso) {
      spentLast30Days += record.cost;
    }

    const carStats = carSpendMap.get(record.carId);
    if (carStats) {
      carStats.totalSpent += record.cost;
      carStats.recordsCount += 1;
    }
  }

  const spentByCar = Array.from(carSpendMap.values())
    .map((item) => ({ ...item, totalSpent: roundMoney(item.totalSpent) }))
    .sort((a, b) => b.totalSpent - a.totalSpent || a.carName.localeCompare(b.carName));

  const recentRecords = records.slice(0, RECENT_RECORDS_LIMIT).map((record) => {
    const car = carMap.get(record.carId);
    return {
      ...record,
      carName: car ? formatCarName(car) : '',
      carPlate: car?.plate ?? '',
    };
  });

  return {
    carsCount: cars.length,
    recordsCount: records.length,
    totalSpent: roundMoney(totalSpent),
    spentLast30Days: roundMoney(spentLast30Days),
    warranties: summarizeWarranties(records, carMap, todayIso),
    spentByCar,
    recentRecords,
  };
}
