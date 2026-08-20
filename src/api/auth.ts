import { apiRequest } from './client';
import type { TokenPair, User } from './types';

export function loginWithPassword(username: string, password: string): Promise<TokenPair> {
  return apiRequest<TokenPair>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ username, password }) },
    { skipAuth: true },
  );
}

export function logout(): Promise<void> {
  return apiRequest<void>('/auth/logout', { method: 'POST' });
}

export function getMe(): Promise<User> {
  return apiRequest<User>('/me');
}
