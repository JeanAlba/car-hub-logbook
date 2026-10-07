import type { NextFunction, Response } from 'express';
import {
  validateCarData,
  validateCarId,
  validateCarUserId,
  validateCarUserIdQuery,
} from '../../src/middlewares/validateCarData';

const userId = '66c47aa12ea87f8123456701';
const validBody = {
  brand: 'Volkswagen',
  model: 'Golf GTI',
  year: 2018,
  plate: 'ABC1D23',
  mileage: 45000,
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

describe('validateCarData', () => {
  it.each([
    ['required fields only', validBody],
    ['nickname', { ...validBody, nickname: 'Daily' }],
    ['lowercase plate with hyphen', { ...validBody, plate: 'abc-1d23' }],
    ['plate with spaces', { ...validBody, plate: 'abc 1d23' }],
    ['minimum year', { ...validBody, year: 1900 }],
    ['next year', { ...validBody, year: new Date().getFullYear() + 1 }],
    ['zero mileage', { ...validBody, mileage: 0 }],
  ])('accepts %s', (_label, body) => {
    const result = run(validateCarData, { body });
    expect(result.next).toHaveBeenCalledTimes(1);
    expect(result.status).not.toHaveBeenCalled();
  });

  it.each([
    ['missing brand', { ...validBody, brand: undefined }],
    ['empty brand', { ...validBody, brand: ' ' }],
    ['missing model', { ...validBody, model: undefined }],
    ['non-integer year', { ...validBody, year: 2018.5 }],
    ['year before 1900', { ...validBody, year: 1899 }],
    ['year after next year', { ...validBody, year: new Date().getFullYear() + 2 }],
    ['string year', { ...validBody, year: '2018' }],
    ['missing plate', { ...validBody, plate: undefined }],
    ['short plate', { ...validBody, plate: 'ABC123' }],
    ['long plate', { ...validBody, plate: 'ABC1D234' }],
    ['plate with symbol', { ...validBody, plate: 'ABC1D2!' }],
    ['negative mileage', { ...validBody, mileage: -1 }],
    ['string mileage', { ...validBody, mileage: '100' }],
    ['missing mileage', { ...validBody, mileage: undefined }],
    ['non-string nickname', { ...validBody, nickname: 10 }],
    ['array body', []],
    ['undefined body', undefined],
  ])('rejects %s', (_label, body) => {
    expectRejected(run(validateCarData, { body }), 'Invalid car data');
  });
});

describe('validateCarId', () => {
  it('accepts a valid id', () => {
    expect(run(validateCarId, { params: { id: userId } }).next).toHaveBeenCalledTimes(1);
  });

  it.each(['123', 'zzzzzzzzzzzzzzzzzzzzzzzz', ''])('rejects malformed id %p', (id) => {
    expectRejected(run(validateCarId, { params: { id } }), 'Invalid identifier');
  });
});

describe('validateCarUserId', () => {
  it('accepts a valid userId in the body', () => {
    expect(run(validateCarUserId, { body: { userId } }).next).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['missing', {}],
    ['malformed', { userId: '123' }],
    ['non-string', { userId: 10 }],
  ])('rejects %s userId', (_label, body) => {
    expectRejected(run(validateCarUserId, { body }), 'Invalid identifier');
  });

  it('rejects an undefined body', () => {
    expectRejected(run(validateCarUserId, {}), 'Invalid identifier');
  });
});

describe('validateCarUserIdQuery', () => {
  it('accepts a valid userId in the query', () => {
    expect(run(validateCarUserIdQuery, { query: { userId } }).next).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['missing', {}],
    ['malformed', { userId: '123' }],
    ['repeated', { userId: [userId, userId] }],
  ])('rejects %s userId', (_label, query) => {
    expectRejected(run(validateCarUserIdQuery, { query }), 'Invalid identifier');
  });
});
