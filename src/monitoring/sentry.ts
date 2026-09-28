import * as Sentry from '@sentry/react';

export interface SentryConfig {
  /** Empty/undefined disables Sentry entirely (e.g. no DSN configured yet, or local dev). */
  dsn: string | undefined;
  environment: string;
  release?: string;
}

let initialized = false;

/**
 * Initialises Sentry for one of the four web apps. A no-op when `dsn` is
 * empty, so calling this unconditionally from `main.tsx` is safe in local
 * dev (no `VITE_SENTRY_DSN` set) and before a real Sentry project exists,
 * same "unset config disables the feature" shape as q-wash-api's push
 * config. `sendDefaultPii` isn't a browser-SDK option (Node-only); the
 * browser SDK already omits IP/cookies by default, so no opt-in is needed.
 */
export function initSentry(config: SentryConfig): void {
  if (!config.dsn || initialized) return;
  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    release: config.release,
  });
  initialized = true;
}

export { ErrorBoundary } from '@sentry/react';
