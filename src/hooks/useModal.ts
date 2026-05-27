import { useModalStore } from '@/store/useModalStore';
import { useEffect } from 'react';

export const useModal = () => {
  const { isModalOpen, closeModal } = useModalStore();

  useEffect(() => {
    if (!isModalOpen) return;

    const closeCurrentModal = (e: KeyboardEvent) => {
      if (isModalOpen && e.key === 'Escape') {
        closeModal();
      } else {
        return;
      }
    };

    window.addEventListener('keydown', closeCurrentModal);
    return () => {
      window.removeEventListener('keydown', closeCurrentModal);
    };
  }, [isModalOpen]);
};
