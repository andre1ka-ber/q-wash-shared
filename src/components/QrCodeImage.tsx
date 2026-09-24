import { create } from 'qrcode';

export interface QrCodeImageProps {
  value: string;
  size?: number;
  background?: string;
  foreground?: string;
}

// Renders a real, scannable QR code as an inline SVG path — same
// "M{x} {y}h1v1h-1z" per-module technique the Claude Design mock's own
// fake generator used, now driven by qrcode's synchronous create() (a
// plain bit matrix, no async/loading state) instead of random noise.
export function QrCodeImage({ value, size = 200, background = '#F6F5EF', foreground = '#191813' }: QrCodeImageProps) {
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

  return (
    <svg width={size} height={size} viewBox={`-2 -2 ${n + 4} ${n + 4}`} shapeRendering="crispEdges">
      <rect x={-2} y={-2} width={n + 4} height={n + 4} fill={background} />
      <path d={d} fill={foreground} />
    </svg>
  );
}
