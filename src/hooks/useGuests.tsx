import { useGuestStore } from '@/store/useGuestStore';
import { useModalStore } from '@/store/useModalStore';
import { useState } from 'react';

export default function useGuest() {
  const addGuest = useGuestStore((s) => s.addGuest);
  const guests = useGuestStore((s) => s.guests)
  const seatedGuests = useGuestStore((s) => s.seatedGuests)
  const closeModal = useModalStore((s) => s.closeModal)

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [dietary, setDietary] = useState<string[]>([]);

    const UnseatedGuestAmount = guests.filter((guest) => !seatedGuests.some((seat) => seat.guestId === guest.id)).length

    const SeatedGuestsAmount = seatedGuests.length
  
  const handleAddGuest = () => {
    addGuest({
      Name: name,
      Email: email,
      Dietary: dietary,
      Comments: comment,
    });

    closeModal()
    setName('');
    setEmail('');
    setComment('');
    setDietary([]);
  };

  console.log('GUESTS:', guests);

  return {
    name,
    email,
    comment,
    dietary,
    setName,
    setEmail,
    setComment,
    setDietary,
    handleAddGuest,
    UnseatedGuestAmount,
    SeatedGuestsAmount
  };
}
