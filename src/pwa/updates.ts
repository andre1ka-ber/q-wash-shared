// Structural subset of vite-plugin-pwa's `registerSW` (from the app's own
// `virtual:pwa-register`) — this package has no dependency on the plugin.
export type RegisterServiceWorker = (options: {
  immediate?: boolean;
  onRegisteredSW?: (swUrl: string, registration: ServiceWorkerRegistration | undefined) => void;
}) => unknown;

const DEFAULT_CHECK_INTERVAL_MS = 60 * 60 * 1000;

// With registerType 'autoUpdate' the plugin reloads the page once a new
// service worker takes over, but the browser only looks for one on
// navigation. A long-lived tab (the lobby display) or a phone app resumed
// from the background never navigates, so also re-check hourly and every
// time the app becomes visible again.
export function startPwaUpdates(register: RegisterServiceWorker, checkIntervalMs = DEFAULT_CHECK_INTERVAL_MS): void {
  register({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      const check = () => {
        registration.update().catch(() => {
          // offline or server down — the next trigger retries
        });
      };
      setInterval(check, checkIntervalMs);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
    },
  });
}
