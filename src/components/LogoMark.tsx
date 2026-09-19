import type { CSSProperties } from 'react';
import { color } from '../theme';

export interface LogoMarkProps {
  size?: number;
  style?: CSSProperties;
}

// The Q Wash mark from the Claude Design mock: a gold rounded square with
// three stacked bars of increasing weight/opacity.
export function LogoMark({ size = 34, style }: LogoMarkProps) {
  const barWidth = size * 0.47;

  return (
    <div
      style={{
        width: size,
        height: size,
        flex: `0 0 ${size}px`,
        borderRadius: size / 3,
        background: color.gold,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: size * 0.09,
        ...style,
      }}
    >
      <div style={{ width: barWidth, height: size * 0.1, borderRadius: 2, background: 'rgba(25,24,19,.3)' }} />
      <div style={{ width: barWidth, height: size * 0.1, borderRadius: 2, background: 'rgba(25,24,19,.58)' }} />
      <div style={{ width: barWidth, height: size * 0.15, borderRadius: 3, background: color.goldOnLight }} />
    </div>
  );
}
