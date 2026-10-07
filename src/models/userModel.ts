import { Schema, model } from 'mongoose';
import type { UserData } from '../types/user';

const userSchema = new Schema<UserData>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
  },
  {
    versionKey: false,
    toJSON: {
      transform: (_document, result: Record<string, unknown>) => {
        result.id = String(result._id);
        delete result._id;
        delete result.password;
        return result;
      },
    },
  },
);

export const UserModel = model<UserData>('User', userSchema, 'users');
