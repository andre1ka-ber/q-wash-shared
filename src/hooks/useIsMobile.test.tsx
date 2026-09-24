import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useIsMobile } from './useIsMobile';

class FakeMediaQueryList {
  matches: boolean;
  private listeners = new Set<() => void>();

  constructor(matches: boolean) {
    this.matches = matches;
  }

  addEventListener(_: 'change', listener: () => void) {
    this.listeners.add(listener);
  }

  removeEventListener(_: 'change', listener: () => void) {
    this.listeners.delete(listener);
  }

  set(matches: boolean) {
    this.matches = matches;
    for (const listener of this.listeners) listener();
  }
}

function Probe({ onRender }: { onRender: (isMobile: boolean) => void }) {
  onRender(useIsMobile(768));
  return null;
}

describe('useIsMobile', () => {
  let container: HTMLDivElement;
  let root: Root;
  let mql: FakeMediaQueryList;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  function render(initialMatches: boolean) {
    mql = new FakeMediaQueryList(initialMatches);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mql));
    const values: boolean[] = [];
    root = createRoot(container);
    act(() => {
      root.render(<Probe onRender={(v) => values.push(v)} />);
    });
    return values;
  }

  it('reflects the initial media query state', () => {
    const values = render(true);
    expect(values.at(-1)).toBe(true);
  });

  it('re-renders when the media query changes', () => {
    const values = render(false);
    expect(values.at(-1)).toBe(false);

    act(() => mql.set(true));
    expect(values.at(-1)).toBe(true);

    act(() => mql.set(false));
    expect(values.at(-1)).toBe(false);
  });

  it('queries the configured breakpoint', () => {
    render(false);
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 768px)');
  });
});
