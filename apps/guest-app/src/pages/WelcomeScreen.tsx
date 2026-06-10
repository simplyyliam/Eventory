import { GuestListContainer } from '@/components';
import { PostCard } from '@/features/welcome-screen';
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
    <GuestListContainer className="items-center justify-center mesh-gradient font-dmSans">
      {!guest ? (
        <div className="">Loading...</div>
      ) : (
        <div className="flex flex-col gap-2.5 p-2.5 items-center justify-between w-full h-full">
          <div className="flex flex-col text-center text-accent">
            <span className='text-3xl'>Welcome</span>
            <span className='text-xl font-instrumentSerif italic'>{guest.name}</span>
          </div>
          <PostCard
          name={guest.name}
          seat={seatNumber ?? ""}
          table={guest.table?.tableNumber ?? 0}
          />
          <span className='text-[10px] font-medium text-accent/50'>powered by eventory</span>
        </div>
      )}
    </GuestListContainer>
  );
};


