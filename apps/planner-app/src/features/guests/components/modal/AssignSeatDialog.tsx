
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GuestCard } from '@/shared/components';
import { useGuestStore } from '@/store/useGuestStore';
import { useTableStore } from '@/store/useTableStore';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableId: string;
  seatId: string;
};

export const AssignSeatDialog = ({
  open,
  onOpenChange,
  tableId,
  seatId,
}: Props) => {
  const guests = useGuestStore((s) => s.guests);
  const seatedGuests = useGuestStore((s) => s.seatedGuests);
  const seatGuest = useGuestStore((s) => s.seatGuest);

  const tables = useTableStore((s) => s.tables);

  const unseatedGuest = guests.filter(
    (guest) => !seatedGuests.some((seat) => seat.guestId === guest.id),
  );

  const table = tables.find((t) => t.id === tableId);
  const seatNumber = seatId.split('-').pop();

  const handleSeatGuest = (guestId: string) => {
    seatGuest(guestId, tableId, seatId);
    onOpenChange(false); // close dialog
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Assign guest to seat</DialogTitle>

          <DialogDescription>
            {table && seatNumber
              ? `${table.name} - Seat ${seatNumber}`
              : 'Select a guest'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-2">
          {unseatedGuest.length > 0 ? (
            unseatedGuest.map((guest) => {
              const initials = guest.Name.split(' ')
                .map((p) => p[0])
                .join('');

              return (
                <GuestCard
                  key={guest.id}
                  name={guest.Name}
                  initials={initials}
                  onClick={() => handleSeatGuest(guest.id)}
                  guestId={guest.id}
                />
              );
            })
          ) : (
            <div className="text-sm text-muted-foreground">
              No unseated guests
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};