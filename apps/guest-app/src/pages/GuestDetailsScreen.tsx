import { GuestListContainer } from '@/components';
import { MessageCard, TicketCard } from '@/features/guests-details';
import { Progress } from '@app/shared/components/ui/progress';
import type { Guest } from '@app/shared/types/event.types';
import { API_BASE_URL } from '@app/shared/utils/api';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export const GuestDetailsScreen = () => {
  const { slug, guestId } = useParams();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(false)

useEffect(() => {
  if (!guestId) return;

  setLoading(true);

  const timer = setTimeout(() => {
    axios
      .get(`${API_BASE_URL}/events/${slug}/guests/${guestId}`)
      .then((res) => {
        console.log('API RESPONSE:', res.data);
        setGuest(res.data);
      })
      .catch((err) => {
        console.error('API ERROR:', err);
      })
      .finally(() => setLoading(false));
  }, 1500)

  return () => clearTimeout(timer);
}, [slug, guestId]);

  const seatNumber = guest?.seat?.split('-').pop()
  
return (
  <GuestListContainer className="items-center justify-center mesh-gradient font-dmSans">
    {loading ? (
      <div className="flex items-center justify-center w-40 h-40">
        <Progress value={90} className="h-3 w-20" />
      </div>
    ) : (
      <div className="flex flex-col gap-2.5 items-center justify-between w-full h-full">
          <TicketCard eventName={slug ?? "No Event?"} guestName={guest?.name ?? "Undefined"} seatNumber={seatNumber ?? "0"} tableNumber={guest?.table?.tableNumber ?? 0}/>
          <MessageCard/>     
        {/* <span className="text-[10px] font-medium text-muted-foreground">
          powered by eventory
        </span> */}
      </div>
    )}
  </GuestListContainer>
);
};


