// localStorage, not a more secure browser store: worker/display apps run on
// shared/kiosk devices, so there's no meaningfully more-secure option
// available in the browser anyway (see q-wash-shared/PLAN.md, "auth/").
const ACCESS_TOKEN_KEY = 'qwash.access_token';
const REFRESH_TOKEN_KEY = 'qwash.refresh_token';

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
