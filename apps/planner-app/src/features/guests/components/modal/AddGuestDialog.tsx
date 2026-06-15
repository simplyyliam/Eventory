import { DietaryComboBox } from '../DietaryComboBox';
import { IconButton } from '@/shared/components';
import { CancelIcon, SaveIcon } from '@hugeicons/core-free-icons';

import { useGuest } from '@/hooks/useGuests';
import { useFormStore } from '@/store/useFormStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@app/shared/components/ui/dialog';
import { Textarea } from '@app/shared/components/ui/textarea';
import { Input, Label } from '@app/shared';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/shared/components/ui/select';
import { useTableStore } from '@/store/useTableStore';
import { useGuestStore } from '@/store/useGuestStore';
import { useModalStore } from '@/store/useModalStore';
import { getTableSeatCount } from '@/features/venue/components/table/table.metrics';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddGuestDialog({ open, onOpenChange }: Props) {
  const name = useFormStore((s) => s.name);
  const email = useFormStore((s) => s.email);
  const comment = useFormStore((s) => s.comment);
  const dietary = useFormStore((s) => s.dietary);
  const tableId = useFormStore((s) => s.tableId);
  const seatId = useFormStore((s) => s.seatId);
  const setField = useFormStore((s) => s.setField);
  const resetForm = useFormStore((s) => s.reset);

  const tables = useTableStore((s) => s.tables);
  const guests = useGuestStore((s) => s.guests);
  const seatGuest = useGuestStore((s) => s.seatGuest);
  const unseatGuest = useGuestStore((s) => s.unseatGuest);

  const editingGuestId = useModalStore((s) => s.editingGuestId);
  const isEditing = !!editingGuestId;

  const { handleAddGuest } = useGuest();

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const getFirstAvailableSeat = (tableId: string, excludeGuestId?: string): string | null => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return null;

    const seatCount = getTableSeatCount(table);

    const occupiedSeats = new Set(
      guests
        .filter((g) => g.tableId === tableId && g.id !== excludeGuestId)
        .map((g) => g.seat)
    );

    for (let i = 1; i <= seatCount; i++) {
      const seat = `${tableId}-seat-${i}`;
      if (!occupiedSeats.has(seat)) return seat;
    }

    return null;
  };

  const handleSave = () => {
    const currentTableId = tableId;
    const currentSeatId = seatId;
    const guest = handleAddGuest({ name, email, dietary, comment });

    if (!guest) return;

    if (isEditing) {
      if (currentTableId && currentSeatId) {
        seatGuest(guest.id, currentTableId, currentSeatId);
      } else if (!currentTableId) {
        unseatGuest(guest.id);
      }
    } else {
      if (currentTableId) {
        const autoSeat = currentSeatId ?? getFirstAvailableSeat(currentTableId);
        if (autoSeat) seatGuest(guest.id, currentTableId, autoSeat);
      }
    }

    resetForm();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) resetForm();
    onOpenChange(newOpen);
  };

  const selectedTable = tables.find((t) => t.id === tableId);

  const seatCount = selectedTable ? getTableSeatCount(selectedTable) : 0;

  const seatOptions = selectedTable
    ? Array.from({ length: seatCount }).map((_, i) => {
        const id = `${selectedTable.id}-seat-${i + 1}`;
        const occupiedBy = guests.find(
          (g) => g.seat === id && g.id !== editingGuestId
        );

        return {
          id,
          label: `Seat ${i + 1}`,
          disabled: !!occupiedBy,
        };
      })
    : [];

  const availableSeats = selectedTable
    ? seatCount -
      guests.filter((g) => g.tableId === tableId && g.id !== editingGuestId)
        .length
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Guest' : 'Add Guest'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update guest details or reassign their seat.'
              : 'Enter guest details to add them to the event.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="Joe Doe"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setField('email', e.target.value)}
              placeholder="joeDoe@gmail.doe"
            />
          </div>

          <div className="grid gap-2">
            <Label>Table (optional)</Label>
            <Select
              value={tableId ?? ''}
              onValueChange={(value) => {
                setField('tableId', value || null);
                setField('seatId', null);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="">No table</SelectItem>
                  {tables.map((table) => {
                    const taken = guests.filter(
                      (g) => g.tableId === table.id && g.id !== editingGuestId
                    ).length;

                    const free = getTableSeatCount(table) - taken;
                    const full = free === 0;

                    return (
                      <SelectItem
                        key={table.id}
                        value={table.id}
                        disabled={full}
                      >
                        {table.name} {full ? '(full)' : `· ${free} seats left`}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {tableId && (
            <div className="grid gap-2">
              <Label>Seat</Label>
              <Select
                value={seatId ?? ''}
                onValueChange={(value) => setField('seatId', value || null)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={isEditing ? 'Change seat' : 'Auto-assign'}
                  >
                    {seatId
                      ? `Seat ${seatId.split('-seat-').pop()}`
                      : undefined}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    {!isEditing && (
                      <SelectItem value="">Auto-assign</SelectItem>
                    )}

                    {seatOptions.map((seat) => (
                      <SelectItem
                        key={seat.id}
                        value={seat.id}
                        disabled={seat.disabled}
                      >
                        {seat.label} {seat.disabled ? '(taken)' : ''}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {!isEditing && !seatId && availableSeats !== null && availableSeats > 0 && (
                <p className="text-xs text-muted-foreground">
                  Will be assigned to the next available seat
                </p>
              )}
            </div>
          )}

          <div className="grid gap-2">
            <Label>Dietary Requirements</Label>
            <DietaryComboBox
              value={dietary}
              onValueChange={(value) => setField('dietary', value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Comments</Label>
            <Textarea
              value={comment}
              onChange={(e) => setField('comment', e.target.value)}
              placeholder="Add any additional comments"
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2.5">
          <IconButton Label="Cancel" Icon={CancelIcon} onClick={handleClose} />
          <IconButton Label="Save" Icon={SaveIcon} onClick={handleSave} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}