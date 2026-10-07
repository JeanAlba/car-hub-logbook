import type { NextFunction, Request, Response } from 'express';
import { validateLoginData } from '../../src/middlewares/validateLoginData';
import { validateUserData } from '../../src/middlewares/validateUserData';
import type { LoginData, UserData } from '../../src/types/user';

const validUser = { name: 'Ana Silva', email: 'ana@example.com', password: 'secret123' };

function createResponse(): { res: Response; status: jest.Mock; json: jest.Mock } {
  const status = jest.fn();
  const json = jest.fn();
  const res = { status, json } as unknown as Response;
  status.mockReturnValue(res);
  return { res, status, json };
}

function runUser(body: unknown): { next: jest.Mock; status: jest.Mock; json: jest.Mock } {
  const { res, status, json } = createResponse();
  const next = jest.fn();
  validateUserData(
    { body } as unknown as Request<object, object, UserData>,
    res,
    next as NextFunction,
  );
  return { next, status, json };
}

function runLogin(body: unknown): { next: jest.Mock; status: jest.Mock; json: jest.Mock } {
  const { res, status, json } = createResponse();
  const next = jest.fn();
  validateLoginData(
    { body } as unknown as Request<object, object, LoginData>,
    res,
    next as NextFunction,
  );
  return { next, status, json };
}

describe('validateUserData', () => {
  it('accepts a valid body', () => {
    const { next, status } = runUser(validUser);
    expect(next).toHaveBeenCalledTimes(1);
    expect(status).not.toHaveBeenCalled();
  });

  it.each([
    ['empty name', { ...validUser, name: '  ' }],
    ['missing name', { email: validUser.email, password: validUser.password }],
    ['invalid email', { ...validUser, email: 'not-an-email' }],
    ['non-string email', { ...validUser, email: 10 }],
    ['short password', { ...validUser, password: '12345' }],
    ['missing password', { name: validUser.name, email: validUser.email }],
    ['array body', []],
    ['undefined body', undefined],
  ])('rejects %s', (_label, body) => {
    const { next, status, json } = runUser(body);
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'Invalid user data' });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('validateLoginData', () => {
  it('accepts a valid body', () => {
    const { next, status } = runLogin({ email: 'ana@example.com', password: 'secret123' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(status).not.toHaveBeenCalled();
  });

  it.each([
    ['missing email', { password: 'secret123' }],
    ['missing password', { email: 'ana@example.com' }],
    ['empty password', { email: 'ana@example.com', password: '' }],
    ['non-string password', { email: 'ana@example.com', password: 123456 }],
    ['array body', []],
  ])('rejects %s', (_label, body) => {
    const { next, status, json } = runLogin(body);
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'Invalid login data' });
    expect(next).not.toHaveBeenCalled();
  });
});
