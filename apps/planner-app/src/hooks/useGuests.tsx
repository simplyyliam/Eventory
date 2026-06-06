import { useGuestStore } from '@/store/useGuestStore';
import { useModalStore } from '@/store/useModalStore';
import { useFormStore } from '@/store/useFormStore';

export const useGuest = () => {
  const addGuest = useGuestStore((s) => s.addGuest);
  const guests = useGuestStore((s) => s.guests);
  const editingGuestId = useModalStore((s) => s.editingGuestId);
  const closeModal = useModalStore((s) => s.closeModal);
  const updateGuest = useGuestStore((s) => s.updateGuest);
  const { name, email, comment, dietary, reset } = useFormStore();

  const UnseatedGuestAmount = guests.filter((g) => !g.tableId).length;
  const SeatedGuestAmount = guests.filter((g) => !!g.tableId).length;

  const handleAddGuest = () => {
    if (editingGuestId) {
      updateGuest(editingGuestId, {
        name,
        email,
        dietary,
        comments: comment,
      });
    } else {
      addGuest({
        name,
        email,
        dietary,
        comments: comment,
      });
    }
    closeModal();
    reset();
  };

  return {
    UnseatedGuestAmount,
    SeatedGuestAmount,
    handleAddGuest,
  };
};