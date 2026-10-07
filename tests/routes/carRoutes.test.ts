import request from 'supertest';
import { app } from '../../src/app';
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
const unknownId = '66c47aa12ea87f8123456799';
const body = {
  brand: 'Volkswagen',
  model: 'Golf GTI',
  year: 2018,
  plate: 'abc-1d23',
  mileage: 45000,
};
const car: Car = { id: carId, userId, ...body, plate: 'ABC1D23' };

beforeEach(() => jest.resetAllMocks());

describe('POST /cars', () => {
  it('creates a car', async () => {
    users.findById.mockResolvedValue({ id: userId, name: 'Ana', email: 'ana@example.com' });
    cars.findByUserIdAndPlate.mockResolvedValue(null);
    cars.create.mockResolvedValue(car);

    const response = await request(app)
      .post('/cars')
      .send({ userId, ...body });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(car);
  });

  it('responds 400 for an invalid body', async () => {
    const response = await request(app)
      .post('/cars')
      .send({ userId, ...body, year: 1800 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid car data' });
  });

  it.each([[{}], [{ userId: '123' }]])('responds 400 for userId %j', async (extra) => {
    const response = await request(app)
      .post('/cars')
      .send({ ...body, ...extra });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid identifier' });
  });

  it('responds 404 when the user does not exist', async () => {
    users.findById.mockResolvedValue(null);

    const response = await request(app)
      .post('/cars')
      .send({ userId: unknownId, ...body });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'User not found' });
  });

  it('responds 409 for a duplicated plate', async () => {
    users.findById.mockResolvedValue({ id: userId, name: 'Ana', email: 'ana@example.com' });
    cars.findByUserIdAndPlate.mockResolvedValue(car);

    const response = await request(app)
      .post('/cars')
      .send({ userId, ...body });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ message: 'Plate already registered for this user' });
  });
});

describe('GET /cars', () => {
  it('lists the cars of a user', async () => {
    cars.listByUserId.mockResolvedValue([car]);

    const response = await request(app).get('/cars').query({ userId });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([car]);
  });

  it('responds 200 with an empty list for an unknown user', async () => {
    cars.listByUserId.mockResolvedValue([]);

    const response = await request(app).get('/cars').query({ userId: unknownId });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it.each([[{}], [{ userId: '123' }]])('responds 400 for query %j', async (query) => {
    const response = await request(app).get('/cars').query(query);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid identifier' });
  });
});

describe('GET /cars/:id', () => {
  it('returns the car', async () => {
    cars.findById.mockResolvedValue(car);

    const response = await request(app).get(`/cars/${carId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(car);
  });

  it('responds 404 for an unknown id', async () => {
    cars.findById.mockResolvedValue(null);

    const response = await request(app).get(`/cars/${unknownId}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Car not found' });
  });

  it('responds 400 for a malformed id', async () => {
    const response = await request(app).get('/cars/123');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid identifier' });
  });
});

describe('PUT /cars/:id', () => {
  it('updates the car', async () => {
    cars.findById.mockResolvedValue(car);
    cars.findByUserIdAndPlate.mockResolvedValue(car);
    cars.update.mockResolvedValue({ ...car, mileage: 50000 });

    const response = await request(app)
      .put(`/cars/${carId}`)
      .send({ ...body, mileage: 50000 });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ mileage: 50000 });
  });

  it('responds 404 for an unknown id', async () => {
    cars.findById.mockResolvedValue(null);

    const response = await request(app).put(`/cars/${unknownId}`).send(body);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Car not found' });
  });

  it('responds 400 for a malformed id', async () => {
    const response = await request(app).put('/cars/123').send(body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid identifier' });
  });

  it('responds 400 for an invalid body', async () => {
    const response = await request(app).put(`/cars/${carId}`).send({ brand: 'VW' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid car data' });
  });

  it('responds 409 when the plate belongs to another car of the user', async () => {
    cars.findById.mockResolvedValue(car);
    cars.findByUserIdAndPlate.mockResolvedValue({ ...car, id: unknownId });

    const response = await request(app).put(`/cars/${carId}`).send(body);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ message: 'Plate already registered for this user' });
  });
});

describe('DELETE /cars/:id', () => {
  it('deletes the car and its service records', async () => {
    cars.remove.mockResolvedValue(true);

    const response = await request(app).delete(`/cars/${carId}`);

    expect(response.status).toBe(204);
    expect(response.text).toBe('');
    expect(records.removeByCarId).toHaveBeenCalledWith(carId);
  });

  it('responds 404 for an unknown id', async () => {
    cars.remove.mockResolvedValue(false);

    const response = await request(app).delete(`/cars/${unknownId}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Car not found' });
  });

  it('responds 400 for a malformed id', async () => {
    const response = await request(app).delete('/cars/123');

    expect(response.status).toBe(400);
  });
});

describe('GET /cars/:id/summary', () => {
  it('returns the summary', async () => {
    cars.findById.mockResolvedValue(car);
    records.listByCarId.mockResolvedValue([]);

    const response = await request(app).get(`/cars/${carId}/summary`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      totalSpent: 0,
      recordsCount: 0,
      lastServiceDate: null,
      spentByType: { MAINTENANCE: 0, REPAIR: 0, MODIFICATION: 0, OTHER: 0 },
    });
  });

  it('responds 404 for an unknown car', async () => {
    cars.findById.mockResolvedValue(null);

    const response = await request(app).get(`/cars/${unknownId}/summary`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Car not found' });
  });

  it('responds 400 for a malformed id', async () => {
    const response = await request(app).get('/cars/123/summary');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid identifier' });
  });
});
