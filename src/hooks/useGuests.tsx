import { useGuestStore } from '@/store/useGuestStore';
import { useModalStore } from '@/store/useModalStore';
import { useFormStore } from '@/store/useFormStore';

export const useGuest = () => {
  const addGuest = useGuestStore((s) => s.addGuest);
  const guests = useGuestStore((s) => s.guests);
  const seatedGuests = useGuestStore((s) => s.seatedGuests);
  const editingGuestId = useModalStore((s) => s.editingGuestId);
  const closeModal = useModalStore((s) => s.closeModal);
  const updateGuest = useGuestStore((s) => s.updateGuest);
  const { name, email, comment, dietary, reset } = useFormStore();

  const UnseatedGuestAmount = guests.filter(
    (guest) => !seatedGuests.some((seat) => seat.guestId === guest.id),
  ).length;

  const SeatedGuestsAmount = seatedGuests.length;

  const handleAddGuest = () => {
    if (editingGuestId) {
      updateGuest(editingGuestId, {
        Name: name,
        Email: email,
        Dietary: dietary,
        Comments: comment,
      });
    } else {
      addGuest({
        Name: name,
        Email: email,
        Dietary: dietary,
        Comments: comment,
      });
    }

    closeModal();
    reset();
  };

  return {
    name,
    email,
    comment,
    dietary,

    UnseatedGuestAmount,
    SeatedGuestsAmount,

    handleAddGuest,
  };
};
