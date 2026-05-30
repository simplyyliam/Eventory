import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GuestCard, IconButton } from '@/shared/components';
import { useGuestStore } from '@/store/useGuestStore';
import { useModalStore } from '@/store/useModalStore';
import { useTableStore } from '@/store/useTableStore';
import { ArrowUpDown } from '@hugeicons/core-free-icons';

type AssignSeatModalData = {
  tableId: string;
  seatId: string;
};

export const AssignSeatModal = () => {
  const guests = useGuestStore((s) => s.guests);
  const seatedGuests = useGuestStore((s) => s.seatedGuests);
  const seatGuest = useGuestStore((s) => s.seatGuest);
  const closeModal = useModalStore((s) => s.closeModal);
  const modalData = useModalStore((s) => s.modalData) as
    | AssignSeatModalData
    | null;
  const tables = useTableStore((s) => s.tables);

  const unseatedGuest = guests.filter(
    (guest) => !seatedGuests.some((seat) => seat.guestId === guest.id),
  );

  const table = tables.find((t) => t.id === modalData?.tableId);
  const seatNumber = modalData?.seatId.split('-').pop();

  const handleSeatGuest = (guestId: string) => {
    if (!modalData) return;

    seatGuest(guestId, modalData.tableId, modalData.seatId);
    closeModal();
  };

  return (
    <Card className="w-full min-w-sm">
      <CardHeader>
        <CardTitle>Assign guest to seat</CardTitle>
        <CardDescription>
          {table && seatNumber ? `${table.name} - Seat ${seatNumber}` : 'Select a guest'}
        </CardDescription>
        <CardAction>
          <IconButton Icon={ArrowUpDown} />
        </CardAction>
      </CardHeader>
      <CardContent>
        {unseatedGuest.length > 0 ? (
          unseatedGuest.map((guest) => {
            const initials = guest.Name.split(' ')
              .map((part) => part[0])
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
          <div>No unseated guests</div>
        )}
      </CardContent>
    </Card>
  );
};
