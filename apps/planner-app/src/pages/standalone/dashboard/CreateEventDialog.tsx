import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@app/shared/components/ui/dialog"
import { IconButton } from '@/shared/components'
import { Input } from '@app/shared/components/ui/input'

interface CreateEventProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (name: string) => Promise<void>
}

export const CreateEventDialog = ({ open, onOpenChange, onConfirm }: CreateEventProps) => {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    const trimmed = name.trim() || 'Untitled Event'
    setLoading(true)
    try {
      await onConfirm(trimmed)
      setName('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
          <DialogDescription>
            Give your event a name to get started.
          </DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="Event name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirm()
            if (e.key === 'Escape') onOpenChange(false)
          }}
          className="h-10 px-2.75"
        />
        <IconButton
          Label={loading ? 'Creating...' : 'Create Event'}
          stretch
          onClick={handleConfirm}
          disabled={loading}
        />
      </DialogContent>
    </Dialog>
  )
}