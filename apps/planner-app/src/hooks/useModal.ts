import { useFormStore } from '@/store/useFormStore';
import { useModalStore } from '@/store/useModalStore';
import { useEffect } from 'react';

export const useModal = () => {
  const modalId= useModalStore((s) => s.modalId)
  const closeModal = useModalStore((s) => s.closeModal)
  const resetForm = useFormStore((s) => s.reset)    

  useEffect(() => {
    if (!modalId) return;

    const closeCurrentModal = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetForm()
        closeModal();
      }
    };

    window.addEventListener('keydown', closeCurrentModal);
    return () => {
      window.removeEventListener('keydown', closeCurrentModal);
    };
  }, [modalId, closeModal]);
};
