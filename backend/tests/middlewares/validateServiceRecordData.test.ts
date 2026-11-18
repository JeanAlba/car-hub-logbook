import type { NextFunction, Response } from 'express';
import {
  validateServiceRecordCarId,
  validateServiceRecordCarIdQuery,
  validateServiceRecordData,
  validateServiceRecordId,
} from '../../src/middlewares/validateServiceRecordData';

const carId = '66c47aa12ea87f8123456702';
const validBody = {
  type: 'MAINTENANCE',
  description: 'Oil change',
  cost: 350.5,
  date: '2026-01-31',
  mileage: 46000,
};

type Result = { next: jest.Mock; status: jest.Mock; json: jest.Mock };

function run(
  middleware: (req: never, res: Response, next: NextFunction) => void,
  req: object,
): Result {
  const status = jest.fn();
  const json = jest.fn();
  const res = { status, json } as unknown as Response;
  status.mockReturnValue(res);
  const next = jest.fn();
  middleware(req as never, res, next as NextFunction);
  return { next, status, json };
}

function expectRejected(result: Result, message: string): void {
  expect(result.status).toHaveBeenCalledWith(400);
  expect(result.json).toHaveBeenCalledWith({ message });
  expect(result.next).not.toHaveBeenCalled();
}

describe('validateServiceRecordData', () => {
  it.each([
    ['required fields only', validBody],
    ['every type', { ...validBody, type: 'MODIFICATION' }],
    ['zero cost', { ...validBody, cost: 0 }],
    ['warranty of 1 month', { ...validBody, warrantyMonths: 1 }],
    ['warranty of 120 months', { ...validBody, warrantyMonths: 120 }],
    ['leap day', { ...validBody, date: '2024-02-29' }],
    ['warrantyExpiresAt in the body', { ...validBody, warrantyExpiresAt: '2030-01-01' }],
  ])('accepts %s', (_label, body) => {
    const result = run(validateServiceRecordData, { body });
    expect(result.next).toHaveBeenCalledTimes(1);
    expect(result.status).not.toHaveBeenCalled();
  });

  it.each([
    ['missing type', { ...validBody, type: undefined }],
    ['type outside the enum', { ...validBody, type: 'WASH' }],
    ['lowercase type', { ...validBody, type: 'repair' }],
    ['missing description', { ...validBody, description: undefined }],
    ['empty description', { ...validBody, description: '  ' }],
    ['negative cost', { ...validBody, cost: -0.01 }],
    ['string cost', { ...validBody, cost: '10' }],
    ['missing cost', { ...validBody, cost: undefined }],
    ['missing date', { ...validBody, date: undefined }],
    ['date with another format', { ...validBody, date: '31/01/2026' }],
    ['date with time', { ...validBody, date: '2026-01-31T10:00:00Z' }],
    ['nonexistent calendar date', { ...validBody, date: '2026-02-30' }],
    ['non-leap February 29', { ...validBody, date: '2026-02-29' }],
    ['month 13', { ...validBody, date: '2026-13-01' }],
    ['negative mileage', { ...validBody, mileage: -1 }],
    ['missing mileage', { ...validBody, mileage: undefined }],
    ['zero warrantyMonths', { ...validBody, warrantyMonths: 0 }],
    ['negative warrantyMonths', { ...validBody, warrantyMonths: -3 }],
    ['decimal warrantyMonths', { ...validBody, warrantyMonths: 1.5 }],
    ['warrantyMonths above 120', { ...validBody, warrantyMonths: 121 }],
    ['string warrantyMonths', { ...validBody, warrantyMonths: '6' }],
    ['array body', []],
    ['undefined body', undefined],
  ])('rejects %s', (_label, body) => {
    expectRejected(run(validateServiceRecordData, { body }), 'Invalid service record data');
  });
});

describe('validateServiceRecordId', () => {
  it('accepts a valid id', () => {
    expect(run(validateServiceRecordId, { params: { id: carId } }).next).toHaveBeenCalledTimes(1);
  });

  it.each(['123', 'zzzzzzzzzzzzzzzzzzzzzzzz', ''])('rejects malformed id %p', (id) => {
    expectRejected(run(validateServiceRecordId, { params: { id } }), 'Invalid identifier');
  });
});

describe('validateServiceRecordCarId', () => {
  it('accepts a valid carId in the body', () => {
    expect(run(validateServiceRecordCarId, { body: { carId } }).next).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['missing', {}],
    ['malformed', { carId: '123' }],
    ['non-string', { carId: 10 }],
  ])('rejects %s carId', (_label, body) => {
    expectRejected(run(validateServiceRecordCarId, { body }), 'Invalid identifier');
  });

  it('rejects an undefined body', () => {
    expectRejected(run(validateServiceRecordCarId, {}), 'Invalid identifier');
  });
});

describe('validateServiceRecordCarIdQuery', () => {
  it('accepts a valid carId in the query', () => {
    expect(run(validateServiceRecordCarIdQuery, { query: { carId } }).next).toHaveBeenCalledTimes(
      1,
    );
  });

  it.each([
    ['missing', {}],
    ['malformed', { carId: '123' }],
    ['repeated', { carId: [carId, carId] }],
  ])('rejects %s carId', (_label, query) => {
    expectRejected(run(validateServiceRecordCarIdQuery, { query }), 'Invalid identifier');
  });
});
