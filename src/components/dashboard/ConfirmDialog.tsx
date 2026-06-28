'use client'

/**
 * ConfirmDialog — a reusable confirmation modal for destructive or significant
 * actions (remove member, delete org, suspend). Built on Modal. The confirm
 * button shows a busy state while the async `onConfirm` resolves.
 */
import { Modal } from './Modal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            className={cn(tone === 'danger' && 'bg-error text-on-error hover:opacity-90')}
          >
            {loading ? 'Working…' : confirmLabel}
          </Button>
        </>
      }
    />
  )
}
