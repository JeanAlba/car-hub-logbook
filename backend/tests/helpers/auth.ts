import request from 'supertest';
import { app } from '../../src/app';
import { signToken } from '../../src/utils/token';

export const authCookie = (userId: string): string => `token=${signToken(userId)}`;

export const authenticatedAs = (userId: string) =>
  request.agent(app).set('Cookie', authCookie(userId));
