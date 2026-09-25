import type { CSSProperties } from 'react';
import { color } from '../theme';

export interface LogoMarkProps {
  size?: number;
  style?: CSSProperties;
}

// The Q Wash mark from the Claude Design mock ("queue bars" direction — a
// dark rounded square with three stacked bars, the bottom one picked out in
// signal yellow as the "active lane"). The mock's own markup for this exact
// element (`Q Wash QR Codes.dc.html`'s sidebar header) uses a dark
// background + border, not a gold one — a previous pass here had it
// backwards (gold background, dark bars).
export function LogoMark({ size = 34, style }: LogoMarkProps) {
  const barWidth = size * 0.47;

  return (
    <div
      style={{
        width: size,
        height: size,
        flex: `0 0 ${size}px`,
        borderRadius: size / 3,
        background: color.goldOnLight,
        border: '1px solid #31312B',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: size * 0.09,
        ...style,
      }}
    >
      <div style={{ width: barWidth, height: size * 0.1, borderRadius: 2, background: color.textDim }} />
      <div style={{ width: barWidth, height: size * 0.1, borderRadius: 2, background: '#8A8778' }} />
      <div style={{ width: barWidth, height: size * 0.15, borderRadius: 3, background: color.gold }} />
    </div>
  );
}
