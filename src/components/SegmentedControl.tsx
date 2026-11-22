import type { CSSProperties } from 'react';
import { color } from '../theme';

export interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name of the group, e.g. "Период". */
  label: string;
  /** Stretch the segments across the full width in equal columns. */
  fill?: boolean;
  style?: CSSProperties;
}

/** The pill-shaped "Сегодня / 7 дней / 30 дней" switch used by the admin analytics and settings screens. */
export function SegmentedControl<T extends string>({ options, value, onChange, label, fill, style }: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      style={{
        display: fill ? 'grid' : 'inline-flex',
        gridTemplateColumns: fill ? `repeat(${options.length},1fr)` : undefined,
        gap: 4,
        padding: 4,
        borderRadius: 13,
        background: color.panel,
        border: `1px solid ${color.borderAlt}`,
        ...style,
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            style={{
              padding: '9px 16px',
              borderRadius: 11,
              border: 'none',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: active ? color.gold : 'transparent',
              color: active ? color.goldOnLight : color.textSecondary,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
