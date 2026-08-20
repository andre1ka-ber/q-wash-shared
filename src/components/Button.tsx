import type { ButtonHTMLAttributes, CSSProperties } from 'react';
import { color, radius } from '../theme';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const base: CSSProperties = {
  padding: '11px 18px',
  borderRadius: radius.md,
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  border: '1px solid transparent',
  fontFamily: 'inherit',
};

export function PrimaryButton({ style, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      style={{ ...base, background: color.gold, color: color.goldOnLight, borderColor: color.gold, ...style }}
    />
  );
}

export function GhostButton({ style, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      style={{
        ...base,
        background: 'transparent',
        color: color.textSecondary,
        borderColor: color.borderStrong,
        ...style,
      }}
    />
  );
}

export function DangerButton({ style, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      style={{ ...base, background: 'transparent', color: color.bad, borderColor: color.badBorder, ...style }}
    />
  );
}
