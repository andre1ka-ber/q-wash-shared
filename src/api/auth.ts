import { apiRequest } from './client';
import type { TokenPair, User } from './types';

export function loginWithPassword(username: string, password: string): Promise<TokenPair> {
  return apiRequest<TokenPair>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ username, password }) },
    { skipAuth: true },
  );
}

// Self-service password change (PATCH /auth/password) — the caller
// proves identity with its current password, unlike
// resetWashingPointCredentials (washingPoints.ts), which regenerates a
// random one-time password and needs no current one (for a forgotten
// password, or an admin acting on someone else's account). On success
// all of the caller's *other* sessions are revoked, but this call
// returns a fresh token pair so the current session keeps working —
// callers should store it the same way authStore.login does.
export function changeOwnPassword(currentPassword: string, newPassword: string): Promise<TokenPair> {
  return apiRequest<TokenPair>('/auth/password', {
    method: 'PATCH',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}

export function logout(): Promise<void> {
  return apiRequest<void>('/auth/logout', { method: 'POST' });
}

export function getMe(): Promise<User> {
  return apiRequest<User>('/me');
}
