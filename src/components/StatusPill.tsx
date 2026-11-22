import type { CSSProperties } from 'react';
import { color, radius } from '../theme';

export type StatusPillKind = 'ok' | 'warn' | 'bad' | 'mute';

const BACKGROUND: Record<StatusPillKind, string> = {
  ok: color.okBg,
  warn: color.warnBg,
  bad: color.badBg,
  mute: color.muteBg,
};

const TEXT: Record<StatusPillKind, string> = {
  ok: color.ok,
  warn: color.warn,
  bad: color.bad,
  mute: color.mute,
};

export interface StatusPillProps {
  kind: StatusPillKind;
  children: React.ReactNode;
  /** "sm" is the compact chip used for table cells like "2 аккаунта". */
  size?: 'md' | 'sm';
}

export function StatusPill({ kind, children, size = 'md' }: StatusPillProps) {
  const style: CSSProperties = {
    display: 'inline-block',
    padding: size === 'sm' ? '4px 9px' : '5px 11px',
    borderRadius: size === 'sm' ? 9 : radius.sm,
    fontSize: size === 'sm' ? 11 : 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    background: BACKGROUND[kind],
    color: TEXT[kind],
  };
  return <span style={style}>{children}</span>;
}
