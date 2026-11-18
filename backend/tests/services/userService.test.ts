import bcrypt from 'bcryptjs';
import * as userRepository from '../../src/repositories/userRepository';
import * as userService from '../../src/services/userService';
import type { User, UserCredentials } from '../../src/types/user';

jest.mock('../../src/repositories/userRepository', () => ({
  create: jest.fn(),
  findByEmail: jest.fn(),
}));

const repository = jest.mocked(userRepository);
const validData = { name: 'Ana Silva', email: 'Ana@Example.com', password: 'secret123' };
const createdUser: User = {
  id: '66c47aa12ea87f8123456701',
  name: 'Ana Silva',
  email: 'ana@example.com',
};

describe('userService', () => {
  beforeEach(() => jest.resetAllMocks());

  it('creates a user with a hashed password and normalized email', async () => {
    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockResolvedValue(createdUser);

    const result = await userService.createUser(validData);

    const saved = repository.create.mock.calls[0][0];
    expect(saved.email).toBe('ana@example.com');
    expect(saved.password).not.toBe(validData.password);
    expect(await bcrypt.compare(validData.password, saved.password)).toBe(true);
    expect(result).toEqual(createdUser);
  });

  it('rejects a duplicated email found before saving', async () => {
    repository.findByEmail.mockResolvedValue({ ...createdUser, password: 'hash' });

    await expect(userService.createUser(validData)).rejects.toMatchObject({
      status: 409,
      message: 'Email already registered',
    });
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('maps a MongoDB duplicate key error to 409', async () => {
    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockRejectedValue({ code: 11000 });

    await expect(userService.createUser(validData)).rejects.toMatchObject({ status: 409 });
  });

  it('rethrows unexpected repository errors', async () => {
    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockRejectedValue(new Error('db down'));

    await expect(userService.createUser(validData)).rejects.toThrow('db down');
  });

  describe('login', () => {
    let stored: UserCredentials;

    beforeAll(async () => {
      stored = { ...createdUser, password: await bcrypt.hash('secret123', 4) };
    });

    it('returns the user without password on success', async () => {
      repository.findByEmail.mockResolvedValue(stored);

      const result = await userService.login({ email: 'ANA@example.com', password: 'secret123' });

      expect(repository.findByEmail).toHaveBeenCalledWith('ana@example.com');
      expect(result).toEqual(createdUser);
    });

    it('rejects a wrong password', async () => {
      repository.findByEmail.mockResolvedValue(stored);

      await expect(
        userService.login({ email: 'ana@example.com', password: 'wrong-password' }),
      ).rejects.toMatchObject({ status: 401, message: 'Invalid credentials' });
    });

    it('rejects an unknown email with the same message', async () => {
      repository.findByEmail.mockResolvedValue(null);

      await expect(
        userService.login({ email: 'none@example.com', password: 'secret123' }),
      ).rejects.toMatchObject({ status: 401, message: 'Invalid credentials' });
    });
  });
});
