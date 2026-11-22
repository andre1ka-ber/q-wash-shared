import type { CSSProperties } from 'react';
import { color, font } from '../theme';
import { Panel } from './Panel';
import { StatusPill, type StatusPillKind } from './StatusPill';

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: { text: string; kind: StatusPillKind } | null;
  /** Phone-size card: smaller label/value, as in the mobile design. */
  compact?: boolean;
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

export function StatCard({ label, value, delta, compact }: StatCardProps) {
  return (
    <Panel style={{ padding: compact ? 14 : 18, borderRadius: compact ? 16 : undefined, display: 'flex', flexDirection: 'column', gap: compact ? 6 : 8 }}>
      <div style={compact ? { ...labelStyle, fontSize: 10.5 } : labelStyle}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: compact ? 7 : 9, flexWrap: 'wrap' }}>
        <div style={compact ? { ...valueStyle, fontSize: 22, fontWeight: 700, letterSpacing: '-.03em' } : valueStyle}>{value}</div>
        {delta && <StatusPill kind={delta.kind} size={compact ? 'sm' : 'md'}>{delta.text}</StatusPill>}
      </div>
    </Panel>
  );
}
