import { color } from '../theme';

export interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}

// Deferred from the original component pass (no built screen needed it
// yet) — first real use is q-wash-cabinet's per-service and per-weekday
// on/off switches.
export function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: 40,
        height: 24,
        borderRadius: 999,
        background: checked ? color.gold : color.muteBg,
        border: `1px solid ${checked ? color.gold : color.borderStrong}`,
        position: 'relative',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        flex: '0 0 auto',
        transition: 'background .15s ease',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 18 : 2,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: checked ? color.goldOnLight : color.textMuted,
          transition: 'left .15s ease',
        }}
      />
    </div>
  );
}
