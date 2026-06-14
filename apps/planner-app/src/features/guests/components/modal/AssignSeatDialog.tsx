import { withHistory } from '@/lib/withHistory';
import { GuestCard } from '@/shared/components';
import { useGuestStore } from '@/store/useGuestStore';
import { useTableStore } from '@/store/useTableStore';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@app/shared/components/ui/dialog';
import { getInitials } from '@/lib/getInitials';

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
  const seatGuest = useGuestStore((s) => s.seatGuest);
  const tables = useTableStore((s) => s.tables);
  const unseatedGuests = guests.filter((guest) => !guest.tableId);
  const table = tables.find((t) => t.id === tableId);
  const seatNumber = seatId.split('-').pop();

  const handleSeatGuest = (guestId: string) => {
    withHistory(() => seatGuest(guestId, tableId, seatId));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onWheel={(e) => {
          e.stopPropagation();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onPointerMove={(e) => {
          e.stopPropagation();
        }}
       className="w-full max-w-md flex flex-col max-h-[70vh] p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-input shrink-0">
          <DialogTitle>Assign to seat</DialogTitle>
          <DialogDescription>
            {table && seatNumber ? `${table.name} · Seat ${seatNumber}` : 'Select a guest'}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-3 py-3">
          {unseatedGuests.length > 0 ? (
            <div className="space-y-0.5">
              {unseatedGuests.map((guest) => (
                <GuestCard
                  key={guest.id}
                  name={guest.name ?? ''}
                  initials={getInitials(guest.name ?? '')}
                  onClick={() => handleSeatGuest(guest.id)}
                  guestId={guest.id}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <span className="text-sm text-muted-foreground">No unseated guests</span>
            </div>
          )}
        </div>

        {unseatedGuests.length > 0 && (
          <div className="px-4 py-3 border-t border-input shrink-0">
            <span className="text-xs text-muted-foreground">
              {unseatedGuests.length} unseated {unseatedGuests.length === 1 ? 'guest' : 'guests'}
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};