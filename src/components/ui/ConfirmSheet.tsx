import { Button } from './Button'
import { Sheet } from './Sheet'

export function ConfirmSheet({
  open,
  title,
  message,
  confirmLabel,
  danger = false,
  busy = false,
  onClose,
  onConfirm,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  danger?: boolean
  busy?: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
}) {
  return (
    <Sheet open={open} title={title} onClose={onClose}>
      <p className="text-sm text-facil-text-secondary">{message}</p>
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose} disabled={busy}>
          Cancelar
        </Button>
        <Button
          variant={danger ? 'danger' : 'primary'}
          className="flex-1"
          disabled={busy}
          onClick={() => void onConfirm()}
        >
          {busy ? 'Espera…' : confirmLabel}
        </Button>
      </div>
    </Sheet>
  )
}
