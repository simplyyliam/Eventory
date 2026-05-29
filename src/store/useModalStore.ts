import { create } from 'zustand';

type ModalStore = {
  modalId: string | null;
  modalData: unknown;
  editingGuestId: string | null
  setEditingGuestId: (guestId: string | null) => void
  openModal: (id: string, data?: unknown) => void;
  closeModal: () => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  modalId: null,
  modalData: null,
  editingGuestId: null,
  openModal: (id, data = null) => {
    set({ modalId: id, modalData: data });
  },
  closeModal: () => {
    set({ modalId: null, modalData: null });
  },
  setEditingGuestId: (guestId) => {
    set({
      editingGuestId: guestId
    })
  }

}));
