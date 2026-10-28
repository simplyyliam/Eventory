import { useState } from 'react';
import { Button, Input } from '@app/shared';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@app/shared/components/ui/dialog';
import { useCreateEvent } from '@/lib/queries';
import { useNewEventDialog } from './newEventStore';
import { Spinner } from '@app/shared/components/ui/spinner';


export function NewEventDialog() {
  const { open, setOpen } = useNewEventDialog();
  const [name, setName] = useState('');
  const create = useCreateEvent();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    create.mutate(trimmed, {
      onSuccess: () => {
        setOpen(false);
        setName('');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New event</DialogTitle>
          <DialogDescription>You can add the date, venue and guests next.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Amara & Theo’s wedding"
            className="h-9"
            aria-label="Event name"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || create.isPending}>
              {create.isPending && <Spinner />}
              Create event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
