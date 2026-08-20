import type { CSSProperties } from 'react';
import { color, font } from '../theme';
import { Panel } from './Panel';
import { StatusPill, type StatusPillKind } from './StatusPill';

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: { text: string; kind: StatusPillKind };
}

const labelStyle: CSSProperties = {
  color: color.textMuted,
  fontSize: 12,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
};

const valueStyle: CSSProperties = {
  color: color.textPrimary,
  fontSize: 28,
  fontWeight: 800,
  fontFamily: font.display,
};

export function StatCard({ label, value, delta }: StatCardProps) {
  return (
    <Panel style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={labelStyle}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
        <div style={valueStyle}>{value}</div>
        {delta && <StatusPill kind={delta.kind}>{delta.text}</StatusPill>}
      </div>
    </Panel>
  );
}
