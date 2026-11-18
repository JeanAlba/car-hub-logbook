import request from 'supertest';
import { app } from '../../src/app';
import * as carRepository from '../../src/repositories/carRepository';
import * as serviceRecordRepository from '../../src/repositories/serviceRecordRepository';
import { authenticatedAs } from '../helpers/auth';

jest.mock('../../src/repositories/carRepository', () => ({
  listByUserId: jest.fn(),
}));
jest.mock('../../src/repositories/serviceRecordRepository', () => ({
  listByCarIds: jest.fn(),
}));

const cars = jest.mocked(carRepository);
const records = jest.mocked(serviceRecordRepository);
const userId = '66c47aa12ea87f8123456701';

describe('GET /dashboard', () => {
  beforeEach(() => jest.resetAllMocks());

  it('responds 401 without a session cookie', async () => {
    const response = await request(app).get('/dashboard');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Unauthorized' });
  });

  it('returns the dashboard summary for the authenticated user', async () => {
    cars.listByUserId.mockResolvedValue([
      {
        id: '66c47aa12ea87f8123456702',
        userId,
        brand: 'VW',
        model: 'Golf GTI',
        year: 2018,
        plate: 'ABC1D23',
        mileage: 45000,
      },
    ]);
    records.listByCarIds.mockResolvedValue([]);

    const response = await authenticatedAs(userId).get('/dashboard');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      carsCount: 1,
      recordsCount: 0,
      totalSpent: 0,
      spentLast30Days: 0,
      warranties: { activeCount: 0, expiringCount: 0, expiredCount: 0, alerts: [] },
      spentByCar: [
        {
          carId: '66c47aa12ea87f8123456702',
          carName: 'VW Golf GTI',
          carPlate: 'ABC1D23',
          totalSpent: 0,
          recordsCount: 0,
        },
      ],
      recentRecords: [],
    });
    expect(cars.listByUserId).toHaveBeenCalledWith(userId);
  });
});
