import type { User } from '@/types'
import { api } from './api'

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export async function login(input: LoginInput): Promise<User> {
  return (await api.post<User>('/login', input)).data
}

export async function register(input: RegisterInput): Promise<User> {
  return (await api.post<User>('/users', input)).data
}

export async function logout(): Promise<void> {
  await api.post('/logout')
}

export async function fetchCurrentUser(): Promise<User> {
  return (await api.get<User>('/me')).data
}
