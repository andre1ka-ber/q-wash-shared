import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { QrCodeImage } from './QrCodeImage';

describe('QrCodeImage', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  function render(el: React.ReactElement) {
    root = createRoot(container);
    act(() => {
      root.render(el);
    });
  }

  it('fills its wrapper by default — width 100%, no height attribute', () => {
    render(<QrCodeImage value="qwash.tj/q/abc123" />);

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('width')).toBe('100%');
    // height is deliberately never set — the viewBox's own 1:1 aspect
    // ratio derives it from whatever width the wrapper ends up giving it,
    // matching the design mock's own <svg width="100%"> (no height) markup.
    expect(svg?.getAttribute('height')).toBeNull();

    const path = container.querySelector('path');
    expect(path).not.toBeNull();
    expect(path?.getAttribute('d')).toMatch(/^(M\d+ \d+h1v1h-1z)+$/);
  });

  it('respects a fixed pixel size when one is given — width and height both set', () => {
    render(<QrCodeImage value="x" size={64} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('64');
    expect(svg?.getAttribute('height')).toBe('64');
  });

  it('encodes different values into different module data', () => {
    render(<QrCodeImage value="aaaaaaaaaaaaaaaaaaaaaa" />);
    const pathA = container.querySelector('path')?.getAttribute('d');

    render(<QrCodeImage value="bbbbbbbbbbbbbbbbbbbbbb" />);
    const pathB = container.querySelector('path')?.getAttribute('d');

    expect(pathA).not.toEqual(pathB);
  });
});
