import { color, font, radius } from '../theme';
import { GhostButton, DangerButton, PrimaryButton } from './Button';

export interface ConfirmDialogProps {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button (destructive/disruptive actions like logout). Default true. */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// A small centered modal for "are you sure?" confirmations — same
// overlay/panel chrome as the drawers (rgba(8,6,8,.62) backdrop, panelAlt
// background, borderStrong border), just centered instead of docked to an
// edge, and with no form of its own since it's a plain yes/no.
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ConfirmButton = danger ? DangerButton : PrimaryButton;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(8,6,8,.62)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: 380,
          maxWidth: '92%',
          borderRadius: radius.xxl,
          background: color.panelAlt,
          border: `1px solid ${color.borderStrong}`,
          padding: '24px 26px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontFamily: font.display, color: color.textPrimary, fontSize: 17, fontWeight: 600 }}>
          {title}
        </div>
        {message && <div style={{ color: color.textSecondary, fontSize: 13.5, lineHeight: 1.5 }}>{message}</div>}
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <GhostButton type="button" onClick={onCancel} style={{ flex: 1, textAlign: 'center', padding: 12, fontSize: 14 }}>
            {cancelLabel}
          </GhostButton>
          <ConfirmButton type="button" onClick={onConfirm} style={{ flex: 1, textAlign: 'center', padding: 12, fontSize: 14 }}>
            {confirmLabel}
          </ConfirmButton>
        </div>
      </div>
    </div>
  );
}
