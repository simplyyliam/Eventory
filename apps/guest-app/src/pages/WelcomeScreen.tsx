import { GuestListContainer } from '@/components';
import type { Guest } from '@app/shared/types/event.types';
import { API_BASE_URL } from '@app/shared/utils/api';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export const WelcomeScreen = () => {
  const { slug, guestId } = useParams();
  const [guest, setGuest] = useState<Guest | null>(null);

  useEffect(() => {
    if (!guestId) return;

    axios
      .get(`${API_BASE_URL}/events/${slug}/guests/${guestId}`)
      .then((res) => {
        console.log('API RESPONSE:', res.data);
        setGuest(res.data);
      })
      .catch((err) => {
        console.error('API ERROR:', err);
      });
  }, [slug, guestId]);

  const seatNumber = guest?.seat?.split('-').pop()
  
  return (
    <GuestListContainer className="items-center justify-center">
      {!guest ? (
        <div className="">Loading...</div>
      ) : (
        <div className="flex flex-col gap-2.5 items-center justify-center ">
          <span>{guest.name}</span>
          <span>Seat {seatNumber}</span>
          <span>Table 7</span>
        </div>
      )}
    </GuestListContainer>
  );
};
