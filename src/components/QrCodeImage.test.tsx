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

  it('renders an svg with a path made of module-square segments', () => {
    render(<QrCodeImage value="qwash.tj/q/abc123" />);

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('width')).toBe('200');
    expect(svg?.getAttribute('height')).toBe('200');

    const path = container.querySelector('path');
    expect(path).not.toBeNull();
    expect(path?.getAttribute('d')).toMatch(/^(M\d+ \d+h1v1h-1z)+$/);
  });

  it('respects a custom size', () => {
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
