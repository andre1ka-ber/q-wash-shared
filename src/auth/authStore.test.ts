import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TokenPair, User } from '../api/types';

vi.mock('../api/auth', () => ({
  getMe: vi.fn(),
  loginWithPassword: vi.fn(),
  logout: vi.fn(),
}));

const user: User = {
  id: 'u1',
  phone_number: '+992000000000',
  name: 'Test User',
  role: 'staff',
  washing_point_id: 'wp1',
  last_login_at: null,
};

async function freshStore() {
  vi.resetModules();
  vi.resetAllMocks();
  localStorage.clear();
  const authApi = await import('../api/auth');
  const { authStore } = await import('./authStore');
  const { tokenStorage } = await import('./tokenStorage');
  const { ApiError } = await import('../api/errors');
  return { authStore, tokenStorage, ApiError, getMe: vi.mocked(authApi.getMe), loginWithPassword: vi.mocked(authApi.loginWithPassword), logoutRequest: vi.mocked(authApi.logout) };
}

describe('AuthStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in loading status', async () => {
    const { authStore } = await freshStore();
    expect(authStore.getSnapshot()).toEqual({ user: null, status: 'loading' });
  });

  it('restore() with no stored token goes straight to unauthenticated without calling the API', async () => {
    const { authStore, getMe } = await freshStore();

    await authStore.restore();

    expect(authStore.getSnapshot().status).toBe('unauthenticated');
    expect(getMe).not.toHaveBeenCalled();
  });

  it('restore() with a valid token sets authenticated on success', async () => {
    const { authStore, tokenStorage, getMe } = await freshStore();
    tokenStorage.setTokens('access', 'refresh');
    getMe.mockResolvedValue(user);

    await authStore.restore();

    expect(authStore.getSnapshot()).toEqual({ user, status: 'authenticated' });
  });

  it('restore() clears tokens immediately on a non-network rejection, no retries', async () => {
    const { authStore, tokenStorage, ApiError, getMe } = await freshStore();
    tokenStorage.setTokens('access', 'refresh');
    getMe.mockRejectedValue(new ApiError('forbidden', 'no', 403));

    await authStore.restore();

    expect(getMe).toHaveBeenCalledTimes(1);
    expect(authStore.getSnapshot().status).toBe('unauthenticated');
    expect(tokenStorage.getAccessToken()).toBeNull();
  });

  it('restore() retries a network_error with backoff and recovers once the network is back', async () => {
    const { authStore, tokenStorage, ApiError, getMe } = await freshStore();
    tokenStorage.setTokens('access', 'refresh');
    getMe
      .mockRejectedValueOnce(new ApiError('network_error', 'no network', 0))
      .mockRejectedValueOnce(new ApiError('network_error', 'no network', 0))
      .mockResolvedValueOnce(user);

    const restorePromise = authStore.restore();
    await vi.advanceTimersByTimeAsync(10_000);
    await restorePromise;

    expect(getMe).toHaveBeenCalledTimes(3);
    expect(authStore.getSnapshot()).toEqual({ user, status: 'authenticated' });
  });

  it('restore() gives up after 5 attempts of a persistent network_error', async () => {
    const { authStore, tokenStorage, ApiError, getMe } = await freshStore();
    tokenStorage.setTokens('access', 'refresh');
    getMe.mockRejectedValue(new ApiError('network_error', 'no network', 0));

    const restorePromise = authStore.restore();
    await vi.advanceTimersByTimeAsync(20_000);
    await restorePromise;

    expect(getMe).toHaveBeenCalledTimes(5);
    expect(authStore.getSnapshot().status).toBe('unauthenticated');
    expect(tokenStorage.getAccessToken()).toBeNull();
  });

  it('login() persists tokens and sets authenticated with the returned user', async () => {
    const { authStore, tokenStorage, loginWithPassword } = await freshStore();
    const pair: TokenPair = {
      access_token: 'access',
      access_token_expires_at: '',
      refresh_token: 'refresh',
      refresh_token_expires_at: '',
      user,
    };
    loginWithPassword.mockResolvedValue(pair);

    await authStore.login('bob', 'secret');

    expect(authStore.getSnapshot()).toEqual({ user, status: 'authenticated' });
    expect(tokenStorage.getAccessToken()).toBe('access');
  });

  it('logout() clears tokens and sets unauthenticated even when the request itself fails', async () => {
    const { authStore, tokenStorage, logoutRequest } = await freshStore();
    tokenStorage.setTokens('access', 'refresh');
    logoutRequest.mockRejectedValue(new Error('server down'));

    await expect(authStore.logout()).rejects.toThrow('server down');

    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(authStore.getSnapshot().status).toBe('unauthenticated');
  });
});
