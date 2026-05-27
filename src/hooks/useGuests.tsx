import { useGuestStore } from '@/store/useGuestStore';
import { useState } from 'react';

export default function useGuest() {
  const addGuest = useGuestStore((s) => s.addGuest);

  const [_name, setName] = useState();
  const [_email, setEmail] = useState();
  const [_comment, setComment] = useState();
  const [_dietary, setDietary] = useState<string[]>([]);

  const handleAddGuest = () => {
    addGuest({
      name: 'liam',
      email: 'matthewsliam812@gmail.com',
      dietary: ['fish', 'olives', 'mushrooms'],
      comments: 'The food was great',
    });
  };

  return {
    setName,
    setEmail,
    setComment,
    setDietary,
    handleAddGuest
  };
}
