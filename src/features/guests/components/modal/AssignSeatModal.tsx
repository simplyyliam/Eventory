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

  const unseatedGuest = guests.filter(
    (guest) => !seatedGuests.some((seat) => seat.guestId === guest.id),
  );

  const handleSeatGuest = (guestId: string) => {
    if (!modalData) return;

    seatGuest(guestId, modalData.tableId, modalData.seatId);
    closeModal();
  };

  return (
    <Card className="w-full min-w-sm">
      <CardHeader>
        <CardTitle>Unseated guests</CardTitle>
        <CardDescription>List of unseated guests</CardDescription>
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
