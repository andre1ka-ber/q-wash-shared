import type { CSSProperties } from 'react';
import { color, radius } from '../theme';

export interface PanelProps {
  children: React.ReactNode;
  style?: CSSProperties;
}

// The repeated rounded/bordered/dark-fill container used across the mock
// for stat cards, the points table, and drawer sections.
export function Panel({ children, style }: PanelProps) {
  const base: CSSProperties = {
    borderRadius: radius.xxxl,
    background: color.panel,
    border: `1px solid ${color.border}`,
    ...style,
  };
  return <div style={base}>{children}</div>;
}
