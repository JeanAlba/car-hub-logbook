import request from 'supertest';
import { app } from '../../src/app';
import { authenticatedAs } from '../helpers/auth';
import * as carRepository from '../../src/repositories/carRepository';
import * as serviceRecordRepository from '../../src/repositories/serviceRecordRepository';
import * as userRepository from '../../src/repositories/userRepository';
import type { Car } from '../../src/types/car';

jest.mock('../../src/repositories/carRepository', () => ({
  create: jest.fn(),
  listByUserId: jest.fn(),
  findById: jest.fn(),
  findByUserIdAndPlate: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));
jest.mock('../../src/repositories/serviceRecordRepository', () => ({
  listByCarId: jest.fn(),
  removeByCarId: jest.fn(),
}));
jest.mock('../../src/repositories/userRepository', () => ({
  findById: jest.fn(),
}));

const cars = jest.mocked(carRepository);
const records = jest.mocked(serviceRecordRepository);
const users = jest.mocked(userRepository);

const userId = '66c47aa12ea87f8123456701';
const carId = '66c47aa12ea87f8123456702';
const otherUserId = '66c47aa12ea87f8123456700';
const unknownId = '66c47aa12ea87f8123456799';
const body = {
  brand: 'Volkswagen',
  model: 'Golf GTI',
  year: 2018,
  plate: 'abc-1d23',
  mileage: 45000,
};
const car: Car = { id: carId, userId, ...body, plate: 'ABC1D23' };

const api = () => authenticatedAs(userId);

beforeEach(() => jest.resetAllMocks());

describe('POST /cars', () => {
  it('creates a car', async () => {
    users.findById.mockResolvedValue({ id: userId, name: 'Ana', email: 'ana@example.com' });
    cars.findByUserIdAndPlate.mockResolvedValue(null);
    cars.create.mockResolvedValue(car);

    const response = await api().post('/cars').send(body);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(car);
  });

  it('responds 400 for an invalid body', async () => {
    const response = await api()
      .post('/cars')
      .send({ ...body, year: 1800 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid car data' });
  });

  it('responds 404 when the user does not exist', async () => {
    users.findById.mockResolvedValue(null);

    const response = await api().post('/cars').send(body);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'User not found' });
  });

  it('responds 409 for a duplicated plate', async () => {
    users.findById.mockResolvedValue({ id: userId, name: 'Ana', email: 'ana@example.com' });
    cars.findByUserIdAndPlate.mockResolvedValue(car);

    const response = await api().post('/cars').send(body);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ message: 'Plate already registered for this user' });
  });
});

describe('GET /cars', () => {
  it('lists the cars of a user', async () => {
    cars.listByUserId.mockResolvedValue([car]);

    const response = await api().get('/cars');

    expect(cars.listByUserId).toHaveBeenCalledWith(userId);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([car]);
  });
});

describe('GET /cars/:id', () => {
  it('returns the car', async () => {
    cars.findById.mockResolvedValue(car);

    const response = await api().get(`/cars/${carId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(car);
  });

  it('responds 404 for an unknown id', async () => {
    cars.findById.mockResolvedValue(null);

    const response = await api().get(`/cars/${unknownId}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Car not found' });
  });

  it('responds 400 for a malformed id', async () => {
    const response = await api().get('/cars/123');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid identifier' });
  });
});

describe('PUT /cars/:id', () => {
  it('updates the car', async () => {
    cars.findById.mockResolvedValue(car);
    cars.findByUserIdAndPlate.mockResolvedValue(car);
    cars.update.mockResolvedValue({ ...car, mileage: 50000 });

    const response = await api()
      .put(`/cars/${carId}`)
      .send({ ...body, mileage: 50000 });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ mileage: 50000 });
  });

  it('responds 404 for an unknown id', async () => {
    cars.findById.mockResolvedValue(null);

    const response = await api().put(`/cars/${unknownId}`).send(body);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Car not found' });
  });

  it('responds 400 for a malformed id', async () => {
    const response = await api().put('/cars/123').send(body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid identifier' });
  });

  it('responds 400 for an invalid body', async () => {
    cars.findById.mockResolvedValue(car);

    const response = await api().put(`/cars/${carId}`).send({ brand: 'VW' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid car data' });
  });

  it('responds 409 when the plate belongs to another car of the user', async () => {
    cars.findById.mockResolvedValue(car);
    cars.findByUserIdAndPlate.mockResolvedValue({ ...car, id: unknownId });

    const response = await api().put(`/cars/${carId}`).send(body);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ message: 'Plate already registered for this user' });
  });
});

describe('DELETE /cars/:id', () => {
  it('deletes the car and its service records', async () => {
    cars.findById.mockResolvedValue(car);
    cars.remove.mockResolvedValue(true);

    const response = await api().delete(`/cars/${carId}`);

    expect(response.status).toBe(204);
    expect(response.text).toBe('');
    expect(records.removeByCarId).toHaveBeenCalledWith(carId);
  });

  it('responds 404 for an unknown id', async () => {
    cars.findById.mockResolvedValue(null);

    const response = await api().delete(`/cars/${unknownId}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Car not found' });
  });

  it('responds 400 for a malformed id', async () => {
    const response = await api().delete('/cars/123');

    expect(response.status).toBe(400);
  });
});

describe('GET /cars/:id/summary', () => {
  it('returns the summary', async () => {
    cars.findById.mockResolvedValue(car);
    records.listByCarId.mockResolvedValue([]);

    const response = await api().get(`/cars/${carId}/summary`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      totalSpent: 0,
      recordsCount: 0,
      lastServiceDate: null,
      costPerKm: null,
      spentByType: { MAINTENANCE: 0, REPAIR: 0, MODIFICATION: 0, OTHER: 0 },
    });
    expect((response.body as { spentByMonth: unknown[] }).spentByMonth).toHaveLength(12);
  });

  it('responds 404 for an unknown car', async () => {
    cars.findById.mockResolvedValue(null);

    const response = await api().get(`/cars/${unknownId}/summary`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Car not found' });
  });

  it('responds 400 for a malformed id', async () => {
    const response = await api().get('/cars/123/summary');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid identifier' });
  });
});

describe('authentication and ownership', () => {
  it('responds 401 without a session cookie', async () => {
    const response = await request(app).get('/cars');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Unauthorized' });
  });

  it('responds 401 for an invalid token', async () => {
    const response = await request(app).get('/cars').set('Cookie', 'token=garbage');

    expect(response.status).toBe(401);
  });

  it('responds 404 for a car owned by another user', async () => {
    cars.findById.mockResolvedValue({ ...car, userId: otherUserId });

    const response = await api().get(`/cars/${carId}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Car not found' });
  });

  it('does not delete a car owned by another user', async () => {
    cars.findById.mockResolvedValue({ ...car, userId: otherUserId });

    const response = await api().delete(`/cars/${carId}`);

    expect(response.status).toBe(404);
    expect(cars.remove).not.toHaveBeenCalled();
  });

  it('ignores a userId sent in the body when creating a car', async () => {
    users.findById.mockResolvedValue({ id: userId, name: 'Ana', email: 'ana@example.com' });
    cars.findByUserIdAndPlate.mockResolvedValue(null);
    cars.create.mockResolvedValue(car);

    await api()
      .post('/cars')
      .send({ userId: otherUserId, ...body });

    expect(cars.create).toHaveBeenCalledWith(expect.objectContaining({ userId }));
  });
});
