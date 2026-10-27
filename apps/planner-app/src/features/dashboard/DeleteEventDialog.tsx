import { useState } from 'react';
import { Button, Input } from '@app/shared';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@app/shared/components/ui/dialog';
import type { EventSummary } from '@/domain/types';

// Typing the name is a deliberate speed bump: deleting removes guests and the layout too.
export function DeleteEventDialog({ event, onClose, onConfirm }: { event: EventSummary | null; onClose: () => void; onConfirm: () => void }) {
  const [typed, setTyped] = useState('');
  const matches = typed.trim() === event?.name.trim();

  return (
    <Dialog
      open={!!event}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setTyped('');
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete “{event?.name}”?</DialogTitle>
          <DialogDescription>
            This removes the event, its {event?.guests.length ?? 0} guests and the floor plan. The guest page stops working. This can’t be undone.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!matches) return;
            onConfirm();
            setTyped('');
          }}
        >
          <label className="flex flex-col gap-1.5 text-[12.5px] text-muted-foreground">
            Type the event name to confirm
            <Input autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={event?.name} className="h-9" />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={!matches}>
              Delete event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
