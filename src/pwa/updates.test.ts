import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { startPwaUpdates, type RegisterServiceWorker } from './updates';

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state });
}

describe('startPwaUpdates', () => {
  let update: ReturnType<typeof vi.fn>;
  let registration: ServiceWorkerRegistration;

  beforeEach(() => {
    vi.useFakeTimers();
    update = vi.fn().mockResolvedValue(undefined);
    registration = { update } as unknown as ServiceWorkerRegistration;
  });
  afterEach(() => {
    vi.useRealTimers();
    setVisibility('visible');
  });

  function start(interval?: number) {
    const register = vi.fn<RegisterServiceWorker>((options) => options.onRegisteredSW?.('/sw.js', registration));
    startPwaUpdates(register, interval);
    return register;
  }

  it('registers immediately', () => {
    const register = start();
    expect(register).toHaveBeenCalledWith(expect.objectContaining({ immediate: true }));
  });

  it('re-checks for a new service worker on the interval', () => {
    start(1000);
    expect(update).not.toHaveBeenCalled();
    vi.advanceTimersByTime(3000);
    expect(update).toHaveBeenCalledTimes(3);
  });

  it('defaults to an hourly check', () => {
    start();
    vi.advanceTimersByTime(59 * 60 * 1000);
    expect(update).not.toHaveBeenCalled();
    vi.advanceTimersByTime(60 * 1000);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('re-checks when the app becomes visible again, not when it is hidden', () => {
    start();
    setVisibility('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(update).not.toHaveBeenCalled();

    setVisibility('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('keeps going when a check fails', async () => {
    update.mockRejectedValue(new Error('offline'));
    start(1000);
    vi.advanceTimersByTime(2000);
    await vi.advanceTimersByTimeAsync(0);
    expect(update).toHaveBeenCalledTimes(2);
  });

  it('does nothing when the browser gave no registration', () => {
    const register: RegisterServiceWorker = (options) => options.onRegisteredSW?.('/sw.js', undefined);
    expect(() => startPwaUpdates(register, 1000)).not.toThrow();
    vi.advanceTimersByTime(5000);
    expect(update).not.toHaveBeenCalled();
  });
});
