import { useModalStore } from '@/store/useModalStore';
import { useEffect } from 'react';
import { useGuest } from './useGuests';

export const useModal = () => {
  const { isModalOpen, closeModal } = useModalStore();
  const { handleAddGuest } = useGuest();
useEffect(() => {
  if (!isModalOpen) return;

  const closeCurrentModal = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };


  window.addEventListener('keydown', closeCurrentModal);
  return () => {
    window.removeEventListener('keydown', closeCurrentModal);
  };
}, [isModalOpen, closeModal, handleAddGuest]); 
};
