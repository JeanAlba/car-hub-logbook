import bcrypt from 'bcryptjs';
import { AppError } from '../errors/appError';
import { isDuplicateKeyError } from '../errors/isDuplicateKeyError';
import * as userRepository from '../repositories/userRepository';
import type { LoginData, User, UserData } from '../types/user';

const PASSWORD_HASH_COST = 10;

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export async function createUser(data: UserData): Promise<User> {
  const email = normalizeEmail(data.email);

  if (await userRepository.findByEmail(email)) {
    throw new AppError(409, 'Email already registered');
  }

  const password = await bcrypt.hash(data.password, PASSWORD_HASH_COST);

  try {
    return await userRepository.create({ name: data.name.trim(), email, password });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError(409, 'Email already registered');
    }
    throw error;
  }
}

export async function login(data: LoginData): Promise<User> {
  const user = await userRepository.findByEmail(normalizeEmail(data.email));

  if (!user || !(await bcrypt.compare(data.password, user.password))) {
    throw new AppError(401, 'Invalid credentials');
  }

  return { id: user.id, name: user.name, email: user.email };
}
