import { beforeEach, describe, expect, it, vi } from 'vitest';

const initMock = vi.fn();
vi.mock('@sentry/react', () => ({ init: initMock, ErrorBoundary: () => null }));

describe('initSentry', () => {
  beforeEach(() => {
    initMock.mockClear();
    vi.resetModules();
  });

  it('is a no-op with no DSN (local dev, or DSN not configured yet)', async () => {
    const { initSentry } = await import('./sentry');
    initSentry({ dsn: undefined, environment: 'production' });
    initSentry({ dsn: '', environment: 'production' });
    expect(initMock).not.toHaveBeenCalled();
  });

  it('initialises Sentry with the given config when a DSN is set', async () => {
    const { initSentry } = await import('./sentry');
    initSentry({ dsn: 'https://key@sentry.example/1', environment: 'production', release: 'app@1.0.0' });
    expect(initMock).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://key@sentry.example/1',
        environment: 'production',
        release: 'app@1.0.0',
      }),
    );
  });

  it('only initialises once even if called again', async () => {
    const { initSentry } = await import('./sentry');
    initSentry({ dsn: 'https://key@sentry.example/1', environment: 'production' });
    initSentry({ dsn: 'https://key@sentry.example/1', environment: 'production' });
    expect(initMock).toHaveBeenCalledTimes(1);
  });
});
