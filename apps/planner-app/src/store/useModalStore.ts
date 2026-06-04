import { create } from 'zustand';

type ModalStore = {
  modalId: string | null;
  modalData: unknown;
  addGuestOpen: boolean;
  editingGuestId: string | null;
  setAddGuestOpen: (open: boolean) => void;
  setEditingGuestId: (guestId: string | null) => void;
  openModal: (id: string, data?: unknown) => void;
  closeModal: () => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  modalId: null,
  modalData: null,
  addGuestOpen: false,
  editingGuestId: null,
  setAddGuestOpen: (open) => set({addGuestOpen: open}),
  openModal: (id, data = null) => {
    set({ modalId: id, modalData: data });
  },
  closeModal: () => {
    set({ modalId: null, modalData: null, addGuestOpen: false, editingGuestId: null });
  },
  setEditingGuestId: (guestId) => {
    set({
      editingGuestId: guestId,
    });
  },
}));
