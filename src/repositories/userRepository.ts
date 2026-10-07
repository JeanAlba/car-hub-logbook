import { UserModel } from '../models/userModel';
import type { User, UserCredentials, UserData } from '../types/user';

export async function create(data: UserData): Promise<User> {
  return (await UserModel.create(data)).toJSON() as unknown as User;
}

export async function findByEmail(email: string): Promise<UserCredentials | null> {
  const item = await UserModel.findOne({ email }).select('+password');
  return item ? { ...(item.toJSON() as unknown as User), password: item.password } : null;
}
