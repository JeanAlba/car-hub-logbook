import * as carRepository from '../../src/repositories/carRepository';
import * as serviceRecordRepository from '../../src/repositories/serviceRecordRepository';
import * as serviceRecordService from '../../src/services/serviceRecordService';
import type { Car } from '../../src/types/car';
import type { ServiceRecord, ServiceRecordData } from '../../src/types/serviceRecord';

jest.mock('../../src/repositories/carRepository', () => ({
  findById: jest.fn(),
}));
jest.mock('../../src/repositories/serviceRecordRepository', () => ({
  create: jest.fn(),
  listByCarId: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));

const cars = jest.mocked(carRepository);
const records = jest.mocked(serviceRecordRepository);

const carId = '66c47aa12ea87f8123456702';
const car: Car = {
  id: carId,
  userId: '66c47aa12ea87f8123456701',
  brand: 'Volkswagen',
  model: 'Golf GTI',
  year: 2018,
  plate: 'ABC1D23',
  mileage: 45000,
};
const validData: ServiceRecordData = {
  carId,
  type: 'MAINTENANCE',
  description: 'Oil change',
  cost: 350.5,
  date: '2026-01-31',
  mileage: 46000,
};
const createdRecord: ServiceRecord = { id: '66c47aa12ea87f8123456703', ...validData };
const utc = (date: string): Date => new Date(`${date}T00:00:00.000Z`);

describe('calculateWarrantyExpiration', () => {
  it.each([
    ['2026-01-15', 1, '2026-02-15'],
    ['2026-01-31', 1, '2026-02-28'],
    ['2024-01-31', 1, '2024-02-29'],
    ['2026-03-31', 1, '2026-04-30'],
    ['2026-11-30', 3, '2027-02-28'],
    ['2026-06-10', 12, '2027-06-10'],
    ['2026-02-28', 120, '2036-02-28'],
  ])('%s + %i months = %s', (date, months, expected) => {
    const result = serviceRecordService.calculateWarrantyExpiration(utc(date), months);
    expect(result.toISOString().slice(0, 10)).toBe(expected);
  });
});

describe('serviceRecordService', () => {
  beforeEach(() => jest.resetAllMocks());

  describe('createServiceRecord', () => {
    it('creates a record without warranty fields when months are omitted', async () => {
      cars.findById.mockResolvedValue(car);
      records.create.mockResolvedValue(createdRecord);

      await expect(serviceRecordService.createServiceRecord(validData)).resolves.toEqual(
        createdRecord,
      );
      const saved = records.create.mock.calls[0][0];
      expect(saved).toEqual({ ...validData, date: utc('2026-01-31') });
      expect(saved).not.toHaveProperty('warrantyExpiresAt');
    });

    it('calculates the warranty expiration when months are given', async () => {
      cars.findById.mockResolvedValue(car);
      records.create.mockResolvedValue(createdRecord);

      await serviceRecordService.createServiceRecord({ ...validData, warrantyMonths: 1 });

      expect(records.create).toHaveBeenCalledWith(
        expect.objectContaining({
          warrantyMonths: 1,
          warrantyExpiresAt: utc('2026-02-28'),
        }),
      );
    });

    it('uses February 29 on leap years', async () => {
      cars.findById.mockResolvedValue(car);
      records.create.mockResolvedValue(createdRecord);

      await serviceRecordService.createServiceRecord({
        ...validData,
        date: '2024-01-31',
        warrantyMonths: 1,
      });

      expect(records.create).toHaveBeenCalledWith(
        expect.objectContaining({ warrantyExpiresAt: utc('2024-02-29') }),
      );
    });

    it('ignores a warrantyExpiresAt sent by the client', async () => {
      cars.findById.mockResolvedValue(car);
      records.create.mockResolvedValue(createdRecord);

      await serviceRecordService.createServiceRecord({
        ...validData,
        warrantyExpiresAt: '2099-01-01',
      } as ServiceRecordData);

      expect(records.create.mock.calls[0][0]).not.toHaveProperty('warrantyExpiresAt');
    });

    it('rejects an unknown car with 404', async () => {
      cars.findById.mockResolvedValue(null);

      await expect(serviceRecordService.createServiceRecord(validData)).rejects.toMatchObject({
        status: 404,
        message: 'Car not found',
      });
      expect(records.create).not.toHaveBeenCalled();
    });
  });

  it('lists records by car', async () => {
    records.listByCarId.mockResolvedValue([createdRecord]);

    await expect(serviceRecordService.listServiceRecords(carId)).resolves.toEqual([createdRecord]);
    expect(records.listByCarId).toHaveBeenCalledWith(carId);
  });

  it('gets a record by id and preserves null', async () => {
    records.findById.mockResolvedValueOnce(createdRecord).mockResolvedValueOnce(null);

    await expect(serviceRecordService.getServiceRecordById(createdRecord.id)).resolves.toEqual(
      createdRecord,
    );
    await expect(serviceRecordService.getServiceRecordById(createdRecord.id)).resolves.toBeNull();
  });

  describe('updateServiceRecord', () => {
    const updateData = {
      type: 'REPAIR' as const,
      description: 'Brake pads',
      cost: 200,
      date: '2026-03-31',
      mileage: 47000,
    };

    it('never changes carId, even if the client sends one', async () => {
      records.update.mockResolvedValue(createdRecord);

      await serviceRecordService.updateServiceRecord(createdRecord.id, {
        ...updateData,
        carId: 'ffffffffffffffffffffffff',
      } as typeof updateData);

      expect(records.update.mock.calls[0][1]).not.toHaveProperty('carId');
    });

    it('recalculates the warranty when date or months change', async () => {
      records.update.mockResolvedValue(createdRecord);

      await serviceRecordService.updateServiceRecord(createdRecord.id, {
        ...updateData,
        warrantyMonths: 1,
      });

      expect(records.update).toHaveBeenCalledWith(
        createdRecord.id,
        expect.objectContaining({ warrantyMonths: 1, warrantyExpiresAt: utc('2026-04-30') }),
      );
    });

    it('removes the warranty when months are omitted', async () => {
      records.update.mockResolvedValue(createdRecord);

      await serviceRecordService.updateServiceRecord(createdRecord.id, updateData);

      const saved = records.update.mock.calls[0][1];
      expect(saved).not.toHaveProperty('warrantyMonths');
      expect(saved).not.toHaveProperty('warrantyExpiresAt');
    });

    it('preserves null when the record does not exist', async () => {
      records.update.mockResolvedValue(null);

      await expect(
        serviceRecordService.updateServiceRecord(createdRecord.id, updateData),
      ).resolves.toBeNull();
    });
  });

  it('preserves the delete result', async () => {
    records.remove.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    await expect(serviceRecordService.deleteServiceRecord(createdRecord.id)).resolves.toBe(true);
    await expect(serviceRecordService.deleteServiceRecord(createdRecord.id)).resolves.toBe(false);
  });
});
