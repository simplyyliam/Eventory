import { GuestListContainer } from '@/components';
import { MessageCard, TicketCard } from '@/features/guests-details';
import { useLocation } from 'react-router-dom';

export const GuestDetailsScreen = () => {
  const location = useLocation()
  const guest = location.state?.guest

  if(!guest) {
    return null
  }

  const seatNumber = guest?.seat?.split('-').pop()
  
return (
    <GuestListContainer className="items-center justify-center mesh-gradient font-dmSans">
      <div className="flex flex-col gap-2.5 items-center justify-between w-full h-full">
        <TicketCard
          eventName={guest.event?.name ?? 'No Event'}
          guestName={guest.name}
          seatNumber={seatNumber ?? '0'}
          tableNumber={guest.table?.tableNumber ?? 0}
        />

        <MessageCard />
      </div>
    </GuestListContainer>
  );
};


