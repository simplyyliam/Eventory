import { useModalStore } from '@/store/useModalStore';
import { useEffect } from 'react';
import { useGuest } from './useGuests';

export const useModal = () => {
  const { modalId, closeModal } = useModalStore();
  const { handleAddGuest } = useGuest();
useEffect(() => {
  if (!modalId) return;

  const closeCurrentModal = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };


  window.addEventListener('keydown', closeCurrentModal);
  return () => {
    window.removeEventListener('keydown', closeCurrentModal);
  };
}, [modalId, closeModal, handleAddGuest]); 
};
