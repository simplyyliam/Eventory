import { useGuestStore } from '@/store/useGuestStore';
import { useModalStore } from '@/store/useModalStore';
import { useHistoryStore } from '@/store/useHistorySnapshot';

export const useGuest = () => {
  const addGuest = useGuestStore((s) => s.addGuest);
  const guests = useGuestStore((s) => s.guests);
  const editingGuestId = useModalStore((s) => s.editingGuestId);
  const closeModal = useModalStore((s) => s.closeModal);
  const updateGuest = useGuestStore((s) => s.updateGuest);

  const UnseatedGuestAmount = guests.filter((g) => !g.tableId).length;
  const SeatedGuestAmount = guests.filter((g) => !!g.tableId).length;

  const handleAddGuest = ({
    name,
    email,
    dietary,
    comment,
  }: {
    name: string;
    email: string;
    dietary: string[];
    comment: string;
  }) => {
    if (editingGuestId) {
      updateGuest(editingGuestId, { name, email, dietary, comments: comment });
      useHistoryStore.getState().save();
      closeModal();
      return useGuestStore.getState().guests.find((g) => g.id === editingGuestId);
    }

    const id = crypto.randomUUID(); 

    const newGuest = {
      id,
      name,
      email,
      dietary,
      comments: comment,
    };

    addGuest(newGuest);
    useHistoryStore.getState().save();
    closeModal();
    return newGuest; 
  };

  return {
    UnseatedGuestAmount,
    SeatedGuestAmount,
    handleAddGuest,
  };
};