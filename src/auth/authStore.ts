import { useSyncExternalStore } from 'react';
import { getMe, loginWithPassword, logout as logoutRequest } from '../api/auth';
import { ApiError } from '../api/errors';
import type { User } from '../api/types';
import { tokenStorage } from './tokenStorage';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  status: AuthStatus;
}

// Framework-agnostic pub/sub store (no state-management library, per
// q-wash-shared/PLAN.md) — each app wires restore()/login()/logout() into
// its own router's redirect logic via the useAuth() hook below.
class AuthStore {
  private state: AuthState = { user: null, status: 'loading' };
  private listeners = new Set<() => void>();

  getSnapshot = (): AuthState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private setState(next: Partial<AuthState>): void {
    this.state = { ...this.state, ...next };
    this.listeners.forEach((listener) => listener());
  }

  // Retries on a plain network failure instead of immediately treating it
  // as "not logged in" — found via q-wash-display's own resilience
  // verification (this screen reloads unattended, potentially for days;
  // a transient network blip at exactly the wrong moment shouldn't force
  // a kiosk into a spurious logged-out state nobody's there to fix). A
  // real auth rejection (any ApiError that isn't network_error — expired/
  // revoked token, 403, etc.) still clears immediately, same as before.
  async restore(): Promise<void> {
    if (!tokenStorage.getAccessToken()) {
      this.setState({ user: null, status: 'unauthenticated' });
      return;
    }
    const maxAttempts = 5;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const user = await getMe();
        this.setState({ user, status: 'authenticated' });
        return;
      } catch (err) {
        const isNetworkError = err instanceof ApiError && err.code === 'network_error';
        if (!isNetworkError || attempt === maxAttempts - 1) {
          tokenStorage.clear();
          this.setState({ user: null, status: 'unauthenticated' });
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
      }
    }
  }

  async login(username: string, password: string): Promise<void> {
    const pair = await loginWithPassword(username, password);
    tokenStorage.setTokens(pair.access_token, pair.refresh_token);
    this.setState({ user: pair.user, status: 'authenticated' });
  }

  async logout(): Promise<void> {
    try {
      await logoutRequest();
    } finally {
      tokenStorage.clear();
      this.setState({ user: null, status: 'unauthenticated' });
    }
  }
}

export const authStore = new AuthStore();

export function useAuth(): AuthState {
  return useSyncExternalStore(authStore.subscribe, authStore.getSnapshot);
}
