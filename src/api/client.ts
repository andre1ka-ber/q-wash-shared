import { tokenStorage } from '../auth/tokenStorage';
import { ApiError, messageForCode } from './errors';
import type { ApiErrorBody, TokenPair } from './types';

// Each consuming app sets VITE_API_BASE_URL in its own .env; this default
// matches q-wash-api's local dev port (see q-wash-api/README.md). Exported
// so ../sse/client.ts can build stream URLs without duplicating this
// resolution logic — apiRequest itself stays the only thing that knows
// about auth/refresh, everything else just needs the base.
export const API_BASE_URL: string =
  (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_API_BASE_URL ??
  'http://localhost:8080/api/v1';

// Uploaded photos are served at a top-level path (e.g. "/uploads/...")
// outside /api/v1 (see q-wash-api's internal/platform/httpserver — not
// under the versioned API router), so resolving them needs the API's
// origin, not the app's own origin an unqualified relative <img src>
// would otherwise resolve against.
const API_ORIGIN: string = new URL(API_BASE_URL).origin;

export function resolveApiAssetUrl(path: string): string {
  return path.startsWith('http') ? path : `${API_ORIGIN}${path}`;
}

interface RequestOptions {
  skipAuth?: boolean;
}

// Single shared in-flight refresh, so N concurrent 401s trigger one refresh
// call instead of N (same coalescing shape as q-wash's dio interceptor).
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) {
    tokenStorage.clear();
    return null;
  }
  const pair = (await res.json()) as TokenPair;
  tokenStorage.setTokens(pair.access_token, pair.refresh_token);
  return pair.access_token;
}

function refreshOnce(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: RequestOptions = {},
  isRetry = false,
): Promise<T> {
  const headers = new Headers(init.headers);
  // A FormData body (multipart uploads) must let fetch set its own
  // Content-Type with the boundary — setting it ourselves breaks parsing.
  if (!(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (!options.skipAuth) {
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError('network_error', messageForCode('network_error', 'Сеть недоступна'), 0);
  }

  if (res.status === 401 && !options.skipAuth && !isRetry) {
    const newAccessToken = await refreshOnce();
    if (newAccessToken) return apiRequest<T>(path, init, options, true);
    throw new ApiError(
      'session_expired',
      messageForCode('session_expired', 'Сессия истекла'),
      401,
    );
  }

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const errorBody = body as ApiErrorBody | null;
    const code = errorBody?.error?.code ?? 'unknown_error';
    const message = messageForCode(code, errorBody?.error?.message ?? 'Не удалось выполнить запрос');
    throw new ApiError(code, message, res.status);
  }

  return body as T;
}
