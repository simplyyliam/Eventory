import { create } from 'zustand';

type ModalStore = {
  modalId: string | null;
  modalData: unknown;
  openModal: (id: string, data?: unknown) => void;
  closeModal: () => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  modalId: null,
  modalData: null,
  openModal: (id, data = null) => {
    set({ modalId: id, modalData: data });
  },
  closeModal: () => {
    set({ modalId: null, modalData: null });
  },
}));
