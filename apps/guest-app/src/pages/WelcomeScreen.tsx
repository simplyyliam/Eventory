import { GuestListContainer } from '@/components';
import type { Guest } from '@app/shared/types/event.types';
import { API_BASE_URL } from '@app/shared/utils/api';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export const WelcomeScreen = () => {
  const { guestId } = useParams();
  const [guest, setGuest] = useState<Guest | null>(null);

  useEffect(() => {
    if (!guestId) return;

    axios
      .get(`${API_BASE_URL}/guests/${guestId}`)
      .then((res) => {
        console.log('API RESPONSE:', res.data);
        setGuest(res.data);
      })
      .catch((err) => {
        console.error('API ERROR:', err);
      });
  }, [guestId]);
  
  return (
    <GuestListContainer className="items-center justify-center">
      {!guest ? (
        <div className="">Loading...</div>
      ) : (
        <div className="">{guest.name}</div>
      )}
    </GuestListContainer>
  );
};
