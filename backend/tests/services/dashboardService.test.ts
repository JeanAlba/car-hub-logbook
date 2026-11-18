import * as carRepository from '../../src/repositories/carRepository';
import * as serviceRecordRepository from '../../src/repositories/serviceRecordRepository';
import * as dashboardService from '../../src/services/dashboardService';
import type { Car } from '../../src/types/car';
import type { ServiceRecord } from '../../src/types/serviceRecord';

jest.mock('../../src/repositories/carRepository', () => ({
  listByUserId: jest.fn(),
}));
jest.mock('../../src/repositories/serviceRecordRepository', () => ({
  listByCarIds: jest.fn(),
}));

const cars = jest.mocked(carRepository);
const records = jest.mocked(serviceRecordRepository);

const userId = '66c47aa12ea87f8123456701';
const carA: Car = {
  id: '66c47aa12ea87f8123456702',
  userId,
  brand: 'Volkswagen',
  model: 'Golf GTI',
  year: 2018,
  plate: 'ABC1D23',
  mileage: 68400,
};
const carB: Car = {
  id: '66c47aa12ea87f8123456703',
  userId,
  brand: 'Honda',
  model: 'Civic Si',
  year: 2008,
  plate: 'XYZ9K88',
  mileage: 142300,
};

const rec = (id: string, overrides: Partial<ServiceRecord>): ServiceRecord => ({
  id,
  carId: carA.id,
  type: 'MAINTENANCE',
  description: 'Service',
  cost: 100,
  date: '2026-11-01',
  mileage: 60000,
  ...overrides,
});

describe('dashboardService', () => {
  beforeEach(() => jest.resetAllMocks());

  it('returns an empty dashboard when the user has no cars', async () => {
    cars.listByUserId.mockResolvedValue([]);

    const result = await dashboardService.getDashboard(userId, new Date('2026-11-16T00:00:00Z'));

    expect(result).toEqual({
      carsCount: 0,
      recordsCount: 0,
      totalSpent: 0,
      spentLast30Days: 0,
      warranties: { activeCount: 0, expiringCount: 0, expiredCount: 0, alerts: [] },
      spentByCar: [],
      recentRecords: [],
    });
    expect(records.listByCarIds).not.toHaveBeenCalled();
  });

  it('aggregates spending, warranty alerts and recent records across cars', async () => {
    cars.listByUserId.mockResolvedValue([carA, carB]);
    records.listByCarIds.mockResolvedValue([
      rec('r1', {
        carId: carA.id,
        cost: 300.1,
        date: '2026-11-10',
        warrantyExpiresAt: '2026-11-26',
      }),
      rec('r2', {
        carId: carB.id,
        cost: 500.2,
        date: '2026-10-20',
        warrantyExpiresAt: '2026-11-01',
      }),
      rec('r3', {
        carId: carB.id,
        cost: 1000,
        date: '2026-09-01',
        warrantyExpiresAt: '2027-06-01',
      }),
      rec('r4', { carId: carA.id, cost: 200, date: '2026-08-01' }),
      rec('r5', { carId: carA.id, cost: 50, date: '2026-07-01' }),
      rec('r6', { carId: carA.id, cost: 25, date: '2026-06-01' }),
    ]);

    const result = await dashboardService.getDashboard(userId, new Date('2026-11-16T00:00:00Z'));

    expect(result.carsCount).toBe(2);
    expect(result.recordsCount).toBe(6);
    expect(result.totalSpent).toBe(2075.3);
    expect(result.spentLast30Days).toBe(800.3);
    expect(result.warranties).toEqual({
      activeCount: 1,
      expiringCount: 1,
      expiredCount: 1,
      alerts: [
        {
          id: 'r1',
          carId: carA.id,
          carName: 'Volkswagen Golf GTI',
          carPlate: 'ABC1D23',
          description: 'Service',
          warrantyExpiresAt: '2026-11-26',
          daysRemaining: 10,
          status: 'EXPIRING',
        },
        {
          id: 'r2',
          carId: carB.id,
          carName: 'Honda Civic Si',
          carPlate: 'XYZ9K88',
          description: 'Service',
          warrantyExpiresAt: '2026-11-01',
          daysRemaining: -15,
          status: 'EXPIRED',
        },
      ],
    });
    expect(result.spentByCar).toEqual([
      {
        carId: carB.id,
        carName: 'Honda Civic Si',
        carPlate: 'XYZ9K88',
        totalSpent: 1500.2,
        recordsCount: 2,
      },
      {
        carId: carA.id,
        carName: 'Volkswagen Golf GTI',
        carPlate: 'ABC1D23',
        totalSpent: 575.1,
        recordsCount: 4,
      },
    ]);
    expect(result.recentRecords).toHaveLength(5);
    expect(result.recentRecords[0]).toMatchObject({
      id: 'r1',
      carName: 'Volkswagen Golf GTI',
      carPlate: 'ABC1D23',
    });
  });

  it('excludes future-dated records from spentLast30Days', async () => {
    cars.listByUserId.mockResolvedValue([carA]);
    records.listByCarIds.mockResolvedValue([
      rec('r-future', { cost: 400, date: '2026-11-20' }),
      rec('r-today', { cost: 150, date: '2026-11-16' }),
    ]);

    const result = await dashboardService.getDashboard(userId, new Date('2026-11-16T00:00:00Z'));

    expect(result.totalSpent).toBe(550);
    expect(result.spentLast30Days).toBe(150);
  });
});
