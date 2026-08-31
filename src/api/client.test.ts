import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from './client';
import { tokenStorage } from '../auth/tokenStorage';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('apiRequest', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the parsed body on a successful request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { hello: 'world' }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await apiRequest<{ hello: string }>('/whatever', {}, { skipAuth: true });

    expect(result).toEqual({ hello: 'world' });
  });

  it('returns undefined for a 204 response without reading a body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await apiRequest('/whatever', {}, { skipAuth: true });

    expect(result).toBeUndefined();
  });

  it('throws a network_error ApiError when fetch itself rejects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    );

    await expect(apiRequest('/whatever', {}, { skipAuth: true })).rejects.toMatchObject({
      code: 'network_error',
      status: 0,
    });
  });

  it('throws an ApiError carrying the server code/message on a non-401 error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(400, { error: { code: 'invalid_hours', message: 'server says no' } }),
      ),
    );

    await expect(apiRequest('/whatever', {}, { skipAuth: true })).rejects.toMatchObject({
      code: 'invalid_hours',
      status: 400,
    });
  });

  it('does not attempt a refresh on 401 when skipAuth is set', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(401, { error: { code: 'invalid_credentials', message: 'no' } }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiRequest('/whatever', {}, { skipAuth: true })).rejects.toMatchObject({
      code: 'invalid_credentials',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('coalesces concurrent 401s into a single refresh call, then retries each request once', async () => {
    tokenStorage.setTokens('old-token', 'refresh-token');
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/auth/refresh')) {
        return jsonResponse(200, {
          access_token: 'new-token',
          access_token_expires_at: '',
          refresh_token: 'new-refresh',
          refresh_token_expires_at: '',
          user: {},
        });
      }
      const authHeader = new Headers(init?.headers).get('Authorization');
      if (authHeader === 'Bearer old-token') {
        return jsonResponse(401, { error: { code: 'session_expired', message: 'expired' } });
      }
      if (authHeader === 'Bearer new-token') {
        return jsonResponse(200, { ok: true });
      }
      throw new Error(`unexpected Authorization header: ${authHeader}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const [a, b] = await Promise.all([apiRequest('/one'), apiRequest('/two')]);

    expect(a).toEqual({ ok: true });
    expect(b).toEqual({ ok: true });
    const refreshCalls = fetchMock.mock.calls.filter(([input]) => String(input).endsWith('/auth/refresh'));
    expect(refreshCalls).toHaveLength(1);
    expect(tokenStorage.getAccessToken()).toBe('new-token');
  });

  it('retries a 401 exactly once — a second 401 after refresh throws instead of looping', async () => {
    tokenStorage.setTokens('old-token', 'refresh-token');
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/auth/refresh')) {
        return jsonResponse(200, {
          access_token: 'new-token',
          access_token_expires_at: '',
          refresh_token: 'new-refresh',
          refresh_token_expires_at: '',
          user: {},
        });
      }
      return jsonResponse(401, { error: { code: 'session_expired', message: 'still expired' } });
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiRequest('/whatever')).rejects.toMatchObject({ code: 'session_expired' });

    const resourceCalls = fetchMock.mock.calls.filter(([input]) => !String(input).endsWith('/auth/refresh'));
    expect(resourceCalls).toHaveLength(2);
  });

  it('clears tokens and throws session_expired when the refresh itself fails', async () => {
    tokenStorage.setTokens('old-token', 'refresh-token');
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith('/auth/refresh')) {
          return new Response(null, { status: 401 });
        }
        return jsonResponse(401, { error: { code: 'session_expired', message: 'expired' } });
      }),
    );

    await expect(apiRequest('/whatever')).rejects.toMatchObject({ code: 'session_expired' });
    expect(tokenStorage.getAccessToken()).toBeNull();
  });
});
