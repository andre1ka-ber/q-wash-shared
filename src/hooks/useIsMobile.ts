import { useSyncExternalStore } from 'react';

const DEFAULT_BREAKPOINT_PX = 768;

function subscribe(query: string, onChange: () => void): () => void {
  const mql = window.matchMedia(query);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

/** True when the viewport is at or below `breakpointPx` (default 768). */
export function useIsMobile(breakpointPx: number = DEFAULT_BREAKPOINT_PX): boolean {
  const query = `(max-width: ${breakpointPx}px)`;
  return useSyncExternalStore(
    (onChange) => subscribe(query, onChange),
    () => window.matchMedia(query).matches,
    () => false,
  );
}
