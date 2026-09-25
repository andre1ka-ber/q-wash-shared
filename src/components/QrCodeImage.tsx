import { create } from 'qrcode';

export interface QrCodeImageProps {
  value: string;
  /**
   * Fixed pixel box (both width and height set explicitly, so it's exact
   * and immune to any ancestor's layout — use this inside CSS Grid/flex
   * contexts, e.g. a grid of cards, where a percentage width can confuse
   * the *container's* own track/flex-basis sizing). Omit it to fill 100%
   * of the wrapper's width instead, with height following automatically
   * from the SVG's own 1:1 viewBox aspect ratio — this is how every QR in
   * the design mock is marked up (`<svg width="100%">`, no height at all)
   * and is the right choice for a wrapper that's already a definite,
   * standalone box (fixed width+height, or the sole child of a simple
   * block container) rather than a grid/flex item sharing space with
   * siblings.
   */
  size?: number;
  background?: string;
  foreground?: string;
}

// Renders a real, scannable QR code as an inline SVG path — same
// "M{x} {y}h1v1h-1z" per-module technique the Claude Design mock's own
// fake generator used, now driven by qrcode's synchronous create() (a
// plain bit matrix, no async/loading state) instead of random noise.
export function QrCodeImage({ value, size, background = '#F6F5EF', foreground = '#191813' }: QrCodeImageProps) {
  const { modules } = create(value, { errorCorrectionLevel: 'M' });
  const n = modules.size;

  let d = '';
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (modules.get(row, col)) {
        d += `M${col} ${row}h1v1h-1z`;
      }
    }
  }

  // Fixed-size mode sets width AND height explicitly (a definite box,
  // never ambiguous to a grid/flex ancestor). Fill mode sets width only —
  // height is deliberately left unset so it derives from the viewBox's
  // own 1:1 aspect ratio — see the `size` doc comment above.
  const sizeStyle = size != null ? { width: size, height: size } : { width: '100%' };

  return (
    <svg
      {...sizeStyle}
      viewBox={`-2 -2 ${n + 4} ${n + 4}`}
      shapeRendering="crispEdges"
      style={{ ...sizeStyle, display: 'block' }}
    >
      <rect x={-2} y={-2} width={n + 4} height={n + 4} fill={background} />
      <path d={d} fill={foreground} />
    </svg>
  );
}
