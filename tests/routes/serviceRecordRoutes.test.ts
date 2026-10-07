import request from 'supertest';
import { app } from '../../src/app';
import * as carRepository from '../../src/repositories/carRepository';
import * as serviceRecordRepository from '../../src/repositories/serviceRecordRepository';
import type { ServiceRecord } from '../../src/types/serviceRecord';

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
const recordId = '66c47aa12ea87f8123456703';
const unknownId = '66c47aa12ea87f8123456799';
const body = {
  type: 'MAINTENANCE',
  description: 'Oil change',
  cost: 350.5,
  date: '2026-01-31',
  mileage: 46000,
  warrantyMonths: 1,
};
const record: ServiceRecord = {
  id: recordId,
  carId,
  type: 'MAINTENANCE',
  description: 'Oil change',
  cost: 350.5,
  date: '2026-01-31',
  mileage: 46000,
  warrantyMonths: 1,
  warrantyExpiresAt: '2026-02-28',
};
const car = {
  id: carId,
  userId: '66c47aa12ea87f8123456701',
  brand: 'VW',
  model: 'Golf',
  year: 2018,
  plate: 'ABC1D23',
  mileage: 1,
};

beforeEach(() => jest.resetAllMocks());

describe('POST /service-records', () => {
  it('creates a record and passes the calculated warranty to the repository', async () => {
    cars.findById.mockResolvedValue(car);
    records.create.mockResolvedValue(record);

    const response = await request(app)
      .post('/service-records')
      .send({ carId, ...body });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(record);
    expect(records.create).toHaveBeenCalledWith(
      expect.objectContaining({ warrantyExpiresAt: new Date('2026-02-28T00:00:00.000Z') }),
    );
  });

  it('responds 400 for an invalid body', async () => {
    const response = await request(app)
      .post('/service-records')
      .send({ carId, ...body, date: '2026-02-30' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid service record data' });
  });

  it.each([[{}], [{ carId: '123' }]])('responds 400 for carId %j', async (extra) => {
    const response = await request(app)
      .post('/service-records')
      .send({ ...body, ...extra });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid identifier' });
  });

  it('responds 404 when the car does not exist', async () => {
    cars.findById.mockResolvedValue(null);

    const response = await request(app)
      .post('/service-records')
      .send({ carId: unknownId, ...body });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Car not found' });
  });
});

describe('GET /service-records', () => {
  it('lists the records of a car', async () => {
    records.listByCarId.mockResolvedValue([record]);

    const response = await request(app).get('/service-records').query({ carId });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([record]);
  });

  it.each([[{}], [{ carId: '123' }]])('responds 400 for query %j', async (query) => {
    const response = await request(app).get('/service-records').query(query);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid identifier' });
  });
});

describe('GET /service-records/:id', () => {
  it('returns the record', async () => {
    records.findById.mockResolvedValue(record);

    const response = await request(app).get(`/service-records/${recordId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(record);
  });

  it('responds 404 for an unknown id', async () => {
    records.findById.mockResolvedValue(null);

    const response = await request(app).get(`/service-records/${unknownId}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Service record not found' });
  });

  it('responds 400 for a malformed id', async () => {
    const response = await request(app).get('/service-records/123');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid identifier' });
  });
});

describe('PUT /service-records/:id', () => {
  it('updates the record', async () => {
    records.update.mockResolvedValue({ ...record, cost: 400 });

    const response = await request(app)
      .put(`/service-records/${recordId}`)
      .send({ ...body, cost: 400 });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ cost: 400 });
  });

  it('responds 404 for an unknown id', async () => {
    records.update.mockResolvedValue(null);

    const response = await request(app).put(`/service-records/${unknownId}`).send(body);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Service record not found' });
  });

  it('responds 400 for a malformed id', async () => {
    const response = await request(app).put('/service-records/123').send(body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid identifier' });
  });

  it('responds 400 for an invalid body', async () => {
    const response = await request(app)
      .put(`/service-records/${recordId}`)
      .send({ ...body, warrantyMonths: 0 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid service record data' });
  });
});

describe('DELETE /service-records/:id', () => {
  it('deletes the record', async () => {
    records.remove.mockResolvedValue(true);

    const response = await request(app).delete(`/service-records/${recordId}`);

    expect(response.status).toBe(204);
    expect(response.text).toBe('');
  });

  it('responds 404 for an unknown id', async () => {
    records.remove.mockResolvedValue(false);

    const response = await request(app).delete(`/service-records/${unknownId}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Service record not found' });
  });

  it('responds 400 for a malformed id', async () => {
    const response = await request(app).delete('/service-records/123');

    expect(response.status).toBe(400);
  });
});
