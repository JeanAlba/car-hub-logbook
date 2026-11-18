import bcrypt from 'bcryptjs';
import request from 'supertest';
import { app } from '../../src/app';
import { authCookie } from '../helpers/auth';
import * as userRepository from '../../src/repositories/userRepository';

jest.mock('../../src/repositories/userRepository', () => ({
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
}));

const users = jest.mocked(userRepository);
const user = { id: '66c47aa12ea87f8123456701', name: 'Ana Silva', email: 'ana@example.com' };
const validUser = { name: 'Ana Silva', email: 'ana@example.com', password: 'secret123' };

describe('POST /users', () => {
  beforeEach(() => jest.resetAllMocks());

  it('creates a user and never returns the password', async () => {
    users.findByEmail.mockResolvedValue(null);
    users.create.mockResolvedValue(user);

    const response = await request(app).post('/users').send(validUser);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(user);
  });

  it('responds 400 for an invalid body', async () => {
    const response = await request(app)
      .post('/users')
      .send({ ...validUser, password: '123' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid user data' });
  });

  it('responds 400 for malformed JSON', async () => {
    const response = await request(app)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send('{bad');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid request' });
  });

  it('responds 409 for a duplicated email', async () => {
    users.findByEmail.mockResolvedValue({ ...user, password: 'hash' });

    const response = await request(app).post('/users').send(validUser);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ message: 'Email already registered' });
  });
});

describe('POST /login', () => {
  beforeEach(() => jest.resetAllMocks());

  it('responds 200 with the user and no password', async () => {
    users.findByEmail.mockResolvedValue({ ...user, password: await bcrypt.hash('secret123', 4) });

    const response = await request(app)
      .post('/login')
      .send({ email: 'ana@example.com', password: 'secret123' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(user);
  });

  it('sets an httpOnly session cookie on success', async () => {
    users.findByEmail.mockResolvedValue({ ...user, password: await bcrypt.hash('secret123', 4) });

    const response = await request(app)
      .post('/login')
      .send({ email: 'ana@example.com', password: 'secret123' });

    const cookie = String(response.headers['set-cookie']);
    expect(cookie).toMatch(/^token=/);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
  });

  it('does not set a cookie when the credentials are wrong', async () => {
    users.findByEmail.mockResolvedValue(null);

    const response = await request(app)
      .post('/login')
      .send({ email: 'none@example.com', password: 'secret123' });

    expect(response.headers['set-cookie']).toBeUndefined();
  });

  it('responds 400 for an invalid body', async () => {
    const response = await request(app).post('/login').send({ email: 'ana@example.com' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid login data' });
  });

  it('responds 401 for a wrong password', async () => {
    users.findByEmail.mockResolvedValue({ ...user, password: await bcrypt.hash('secret123', 4) });

    const response = await request(app)
      .post('/login')
      .send({ email: 'ana@example.com', password: 'wrong' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid credentials' });
  });

  it('responds 401 for an unknown email', async () => {
    users.findByEmail.mockResolvedValue(null);

    const response = await request(app)
      .post('/login')
      .send({ email: 'none@example.com', password: 'secret123' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid credentials' });
  });
});

describe('GET /me', () => {
  beforeEach(() => jest.resetAllMocks());

  it('returns the user of the session', async () => {
    users.findById.mockResolvedValue(user);

    const response = await request(app).get('/me').set('Cookie', authCookie(user.id));

    expect(response.status).toBe(200);
    expect(response.body).toEqual(user);
  });

  it('responds 401 without a cookie', async () => {
    const response = await request(app).get('/me');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Unauthorized' });
  });

  it('responds 401 when the user no longer exists', async () => {
    users.findById.mockResolvedValue(null);

    const response = await request(app).get('/me').set('Cookie', authCookie(user.id));

    expect(response.status).toBe(401);
  });
});

describe('POST /logout', () => {
  it('clears the session cookie', async () => {
    const response = await request(app).post('/logout');

    expect(response.status).toBe(204);
    expect(String(response.headers['set-cookie'])).toMatch(/^token=;/);
  });
});

describe('app', () => {
  it('responds 200 on /health', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('responds 404 for an unknown route', async () => {
    const response = await request(app).get('/nothing');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Route not found' });
  });
});
