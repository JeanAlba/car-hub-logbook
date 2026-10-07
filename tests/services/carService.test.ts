import * as carRepository from '../../src/repositories/carRepository';
import * as serviceRecordRepository from '../../src/repositories/serviceRecordRepository';
import * as userRepository from '../../src/repositories/userRepository';
import * as carService from '../../src/services/carService';
import type { Car, CarData } from '../../src/types/car';
import type { ServiceRecord } from '../../src/types/serviceRecord';

jest.mock('../../src/repositories/carRepository', () => ({
  create: jest.fn(),
  listByUserId: jest.fn(),
  findById: jest.fn(),
  findByUserIdAndPlate: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));
jest.mock('../../src/repositories/serviceRecordRepository', () => ({
  removeByCarId: jest.fn(),
  listByCarId: jest.fn(),
}));
jest.mock('../../src/repositories/userRepository', () => ({
  findById: jest.fn(),
}));

const cars = jest.mocked(carRepository);
const records = jest.mocked(serviceRecordRepository);
const users = jest.mocked(userRepository);

const userId = '66c47aa12ea87f8123456701';
const validData: CarData = {
  userId,
  brand: 'Volkswagen',
  model: 'Golf GTI',
  year: 2018,
  plate: 'abc-1d23',
  mileage: 45000,
  nickname: 'Daily',
};
const createdCar: Car = {
  id: '66c47aa12ea87f8123456702',
  ...validData,
  plate: 'ABC1D23',
};
const user = { id: userId, name: 'Ana', email: 'ana@example.com' };

describe('carService', () => {
  beforeEach(() => jest.resetAllMocks());

  describe('createCar', () => {
    it('creates a car with a normalized plate', async () => {
      users.findById.mockResolvedValue(user);
      cars.findByUserIdAndPlate.mockResolvedValue(null);
      cars.create.mockResolvedValue(createdCar);

      await expect(carService.createCar(validData)).resolves.toEqual(createdCar);
      expect(cars.findByUserIdAndPlate).toHaveBeenCalledWith(userId, 'ABC1D23');
      expect(cars.create).toHaveBeenCalledWith({ ...validData, plate: 'ABC1D23' });
    });

    it('persists only allowed fields', async () => {
      users.findById.mockResolvedValue(user);
      cars.findByUserIdAndPlate.mockResolvedValue(null);
      cars.create.mockResolvedValue(createdCar);

      await carService.createCar({ ...validData, id: 'x', extra: true } as CarData);

      expect(cars.create).toHaveBeenCalledWith({ ...validData, plate: 'ABC1D23' });
    });

    it('rejects an unknown user with 404', async () => {
      users.findById.mockResolvedValue(null);

      await expect(carService.createCar(validData)).rejects.toMatchObject({
        status: 404,
        message: 'User not found',
      });
      expect(cars.create).not.toHaveBeenCalled();
    });

    it('rejects a duplicated plate found before saving', async () => {
      users.findById.mockResolvedValue(user);
      cars.findByUserIdAndPlate.mockResolvedValue(createdCar);

      await expect(carService.createCar(validData)).rejects.toMatchObject({
        status: 409,
        message: 'Plate already registered for this user',
      });
      expect(cars.create).not.toHaveBeenCalled();
    });

    it('maps a MongoDB duplicate key error to 409', async () => {
      users.findById.mockResolvedValue(user);
      cars.findByUserIdAndPlate.mockResolvedValue(null);
      cars.create.mockRejectedValue({ code: 11000 });

      await expect(carService.createCar(validData)).rejects.toMatchObject({ status: 409 });
    });
  });

  it('rethrows unexpected repository errors on create', async () => {
    users.findById.mockResolvedValue(user);
    cars.findByUserIdAndPlate.mockResolvedValue(null);
    cars.create.mockRejectedValue(new Error('db down'));

    await expect(carService.createCar(validData)).rejects.toThrow('db down');
  });

  it('lists cars by user', async () => {
    cars.listByUserId.mockResolvedValue([createdCar]);

    await expect(carService.listCars(userId)).resolves.toEqual([createdCar]);
    expect(cars.listByUserId).toHaveBeenCalledWith(userId);
  });

  it('gets a car by id and preserves null', async () => {
    cars.findById.mockResolvedValueOnce(createdCar).mockResolvedValueOnce(null);

    await expect(carService.getCarById(createdCar.id)).resolves.toEqual(createdCar);
    await expect(carService.getCarById(createdCar.id)).resolves.toBeNull();
  });

  describe('updateCar', () => {
    const updateData = {
      brand: validData.brand,
      model: validData.model,
      year: validData.year,
      plate: validData.plate,
      mileage: validData.mileage,
      nickname: validData.nickname,
    };

    it('updates without changing userId, ignoring a userId in the body', async () => {
      cars.findById.mockResolvedValue(createdCar);
      cars.findByUserIdAndPlate.mockResolvedValue(createdCar);
      cars.update.mockResolvedValue(createdCar);

      const body = { ...updateData, userId: 'ffffffffffffffffffffffff' } as typeof updateData;
      await carService.updateCar(createdCar.id, body);

      expect(cars.findByUserIdAndPlate).toHaveBeenCalledWith(userId, 'ABC1D23');
      expect(cars.update).toHaveBeenCalledWith(createdCar.id, {
        ...updateData,
        plate: 'ABC1D23',
      });
    });

    it('removes nickname when omitted', async () => {
      cars.findById.mockResolvedValue(createdCar);
      cars.findByUserIdAndPlate.mockResolvedValue(null);
      cars.update.mockResolvedValue(createdCar);

      await carService.updateCar(createdCar.id, { ...updateData, nickname: undefined });

      expect(cars.update.mock.calls[0][1]).not.toHaveProperty('nickname');
    });

    it('returns null when the car does not exist', async () => {
      cars.findById.mockResolvedValue(null);

      await expect(carService.updateCar(createdCar.id, updateData)).resolves.toBeNull();
      expect(cars.update).not.toHaveBeenCalled();
    });

    it('rejects a plate used by another car of the user', async () => {
      cars.findById.mockResolvedValue(createdCar);
      cars.findByUserIdAndPlate.mockResolvedValue({ ...createdCar, id: 'other' });

      await expect(carService.updateCar(createdCar.id, updateData)).rejects.toMatchObject({
        status: 409,
      });
    });

    it('maps a MongoDB duplicate key error to 409', async () => {
      cars.findById.mockResolvedValue(createdCar);
      cars.findByUserIdAndPlate.mockResolvedValue(null);
      cars.update.mockRejectedValue({ code: 11000 });

      await expect(carService.updateCar(createdCar.id, updateData)).rejects.toMatchObject({
        status: 409,
      });
    });
  });

  describe('deleteCar', () => {
    it('removes the car and its service records', async () => {
      cars.remove.mockResolvedValue(true);

      await expect(carService.deleteCar(createdCar.id)).resolves.toBe(true);
      expect(records.removeByCarId).toHaveBeenCalledWith(createdCar.id);
    });

    it('returns false without cascading when the car does not exist', async () => {
      cars.remove.mockResolvedValue(false);

      await expect(carService.deleteCar(createdCar.id)).resolves.toBe(false);
      expect(records.removeByCarId).not.toHaveBeenCalled();
    });
  });

  describe('getCarSummary', () => {
    const record = (overrides: Partial<ServiceRecord>): ServiceRecord => ({
      id: 'r',
      carId: createdCar.id,
      type: 'MAINTENANCE',
      description: 'x',
      cost: 0,
      date: '2026-01-01',
      mileage: 0,
      ...overrides,
    });

    it('returns null when the car does not exist', async () => {
      cars.findById.mockResolvedValue(null);

      await expect(carService.getCarSummary(createdCar.id)).resolves.toBeNull();
      expect(records.listByCarId).not.toHaveBeenCalled();
    });

    it('returns zeros and a null date when there are no records', async () => {
      cars.findById.mockResolvedValue(createdCar);
      records.listByCarId.mockResolvedValue([]);

      await expect(carService.getCarSummary(createdCar.id)).resolves.toEqual({
        totalSpent: 0,
        recordsCount: 0,
        lastServiceDate: null,
        spentByType: { MAINTENANCE: 0, REPAIR: 0, MODIFICATION: 0, OTHER: 0 },
      });
    });

    it('sums costs by type, rounds to 2 decimals and finds the latest date', async () => {
      cars.findById.mockResolvedValue(createdCar);
      records.listByCarId.mockResolvedValue([
        record({ type: 'MAINTENANCE', cost: 0.1, date: '2026-03-10' }),
        record({ type: 'MAINTENANCE', cost: 0.2, date: '2026-05-02' }),
        record({ type: 'REPAIR', cost: 100.555, date: '2026-01-31' }),
        record({ type: 'MODIFICATION', cost: 2000, date: '2025-12-31' }),
      ]);

      await expect(carService.getCarSummary(createdCar.id)).resolves.toEqual({
        totalSpent: 2100.86,
        recordsCount: 4,
        lastServiceDate: '2026-05-02',
        spentByType: { MAINTENANCE: 0.3, REPAIR: 100.56, MODIFICATION: 2000, OTHER: 0 },
      });
    });
  });
});
